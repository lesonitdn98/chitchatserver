const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

const googleLibphonenumber = require("google-libphonenumber")
const phoneUtil = googleLibphonenumber.PhoneNumberUtil.getInstance();
const authMiddleware = require("../../middleware/auth");
const randomInt = require('random-int');

const User = require("../../models/User");
const Phone = require("../../models/Phone");
const Email = require("../../models/Email");
const Dob = require("../../models/Dob");
const ValidToken = require("../../models/ValidToken");

// @route POST api/user
// @desc Create An User
// @access Public
router.post("/", (req, res) => {
    console.log("Register body :", req.body);
    let {full_name, phone_number, password} = req.body

    //Simple validation
    if (!full_name) {
        return res.status(400).json({
            status: 400,
            msg: "Please enter full name!"
        })
    } else if (!phone_number) {
        return res.status(400).json({
            status: 400,
            msg: "Please enter phone number!"
        })
    } else if (!phoneUtil.isValidNumberForRegion(phoneUtil.parse(phone_number, 'VN'), 'VN')) {
        return res.status(400).json({
            status: 400,
            msg: "Please enter a valid phone number!"
        })
    } else if (!phone_number) {
        return res.status(400).json({
            status: 400,
            msg: "Please enter password!"
        })
    }

    var username = full_name.toLowerCase().replace(/\s/g, '');

    User.findOne({username}).then(user => {
        if (user) {
            username = username.concat(randomInt(10, 1000));
        }
    });

    console.log("Username :", username);

    Phone.findOne({phone_number}).then(phone => {
        if (phone) {
            console.log("Phone: ", phone)
            return res.status(400).json({
                status: 400,
                msg: "Phone number already exists"
            });
        };
        new Phone({
            phone_number
        }).save(function (err, phone) {
            new Email().save(function (err, email) {
                new Dob().save(function (err, dob) {
                    const newUser = new User({
                        full_name,
                        phone,
                        password,
                        username,
                        email,
                        dob,
                        avatar: "https://leson.tech/public/avatar/avatar_1.png"
                    });
                    createUser(res, newUser);
                })
            })
        });
    });
});

function createUser(res, newUser) {
  //Create salt and hash
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        console.log("failed bcrypt");
        res.status(401)
          .json({
            status: 401,
            msg: "bcrypt password failed"
          });
      };
      newUser.password = hash;
      newUser.save().then(user => {
        jwt.sign(
          { id: user.id },
          config.get("jwtSecret"),
          (err, token) => {
            if (err) {
              console.log("failed bcrypt");
              res.status(401)
                .json({
                  status: 401,
                  msg: "jwt failed"
                });
            };
            new ValidToken({token}).save();
            res.status(200)
              .json({
                status: 200,
                user: {
                  id: user.id,
                  token,
                  username: user.username,
                  avatar: user.avatar
                }
              });
          });
        });
      });
  });
}

// @route POST api/user/login
// @desc Login
// @access Public
router.post("/login", (req, res) => {
  let {phone_number, password} = req.body;

  //Simple validation
  if (!phone_number) {
    return res.status(400).json({
        status: 400,
        msg: "Please enter phone number!"
    })
  } else if (!password) {
      return res.status(400).json({
          status: 400,
          msg: "Please enter password!"
      })
  }

  //Check for existing user
  Phone.findOne({phone_number}).then(phone => {
    if(!phone) {
      console.log("phone number not exist");
      return res.status(401).json({ status: 401, msg: "User does not exists" });
    } else {
      User.findOne({phone}).then(user => {
        if (!user) {
          console.log("user not exist");
          return res.status(401).json({ status: 401, msg: "User does not exists" });
        } else {
          validatePass(res, password, user);
        }
      })
    }
  });
});

function validatePass(res, password, user) {
  //Validate password
  bcrypt.compare(password, user.password).then(isMatch => {
    if (!isMatch) return res.status(401).json({ status: 401, msg: "Password is incorect!" });
    jwt.sign(
      {
        id: user.id
      },
      config.get("jwtSecret"),
      (err, token) => {
        if (err) {
          console.log("failed valid jwt");
          res.status(401)
            .json({
              status: 401,
              msg: "failed valid token"
            });
        };
        new ValidToken({token}).save();
        const responseUser = {
          id: user._id,
          token,
          username: user.username,
          avatar: user.avatar
        };
        res.status(200)
          .json({
            status: 200,
            user: responseUser
          });

      }
    );
  });
}

// @route GET api/user
// @desc Get User Info
// @access Public
router.get("/", authMiddleware, (req, res) => {
  const condition = { _id: req.user.id };
  User.findOne(condition)
    .select("-password")
    .then(user => {
      if (user) {
        Dob.findOne({_id: user.dob}).then(dob => {
          Email.findOne({_id: user.email}).then(email => {
            Phone.findOne({_id: user.phone}).then(phone => {
              res.status(200)
                .json({
                  status: 200,
                  user: {
                    id: user._id,
                    username: user.username,
                    full_name: user.full_name,
                    email: {
                      email_id: email._id,
                      email_address: email.email_address,
                      email_state: email.email_state
                    },
                    phone: {
                      phone_id: phone._id,
                      phone_number: phone.phone_number,
                      phone_state: phone.phone_state
                    },
                    dob: {
                      dob_id: dob._id,
                      date_of_birth: dob.date_of_birth,
                      dob_state: dob.dob_state
                    },
                    gender: user.gender,
                    bio: user.bio,
                    avatar: user.avatar,
                    state: user.state,
                    created_at: user.created_at
                  }
                });
            })
          })
        })

      } else {
        res.status(400).json({
          status: 400,
          msg: "Get user infor failed"
        });
      }
  });
});

// @route POST api/user/update
// @desc Update User Info
// @access Public
router.put("/update", authMiddleware, (req, res) => {

  var condition = { _id: req.user.id };
  let {full_name, gender, date_of_birth, dob_state, email_address, email_state, bio, avatar} = req.body;

  User.findOne(condition).then(user => {
    if(!user) {
      return res.status(400).json({
        status: 400,
        msg: "User not exists"
      });
    }
    if (full_name) {
      user.update({$set:{full_name}}).exec();
    }
    if (gender) {
      user.update({$set:{gender}}).exec();
    }
    if (bio) {
      user.update({$set:{bio}}).exec();
    }
    if (avatar) {
      user.update({$set:{avatar}}).exec();
    }
    if (date_of_birth) {
      Dob.findOneAndUpdate({_id: user.dob}, {$set:{date_of_birth}}).then();
    }
    if (dob_state) {
      Dob.findOneAndUpdate({_id: user.dob}, {$set:{dob_state}}).then();
    }
    if (email_address) {
      Email.findOneAndUpdate({_id: user.email}, {$set:{email_address}}).then();
    }
    if (email_state) {
      Email.findOneAndUpdate({_id: user.email}, {$set:{email_state}}).then();
    }
    res.status(200)
      .json({
        status: 200,
        msg: "Success" 
      });
  })
  
});

// @route POST api/user/password
// @desc Reset User Password
// @access Public
router.put("/password", authMiddleware, (req, res) => {
  const token = req.header("auth-token");
  const condition = { _id: req.user.id };
  let {password, new_password} = req.body;

  //Simple validation
  if (!password) {
    return res.status(400).json({
        status: 400,
        msg: "Please enter password!"
    })
  } else if (!new_password) {
      return res.status(400).json({
          status: 400,
          msg: "Please enter new password!"
      })
  }

  User.findOne(condition).then(user => {
    if (!user) {
      return res.status(401).json({ status: 401, msg: "User does not exists" });
    }
    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch) return res.status(401).json({ status: 401, msg: "Password is incorect!" });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(new_password, salt, (err, hash) => {
          if (err) {
            console.log("failed bcrypt");
            res.status(401)
              .json({
                status: 401,
                msg: "bcrypt password failed"
              });
          };
          new_password = hash;
          user.update({$set:{password: new_password}}).exec();
          ValidToken.findOneAndDelete({token}).then();
          jwt.sign(
            { id: user._id },
            config.get("jwtSecret"),
            (err, token) => {
              if (err) {
                console.log("failed bcrypt");
                res.status(401)
                  .json({
                    status: 401,
                    msg: "jwt failed"
                  });
              };
              new ValidToken({token}).save();
              res.status(200)
                .json({
                  status: 200,
                  user: {
                    id: user.id,
                    token,
                    username: user.username,
                    avatar: user.avatar
                  }
                });
          });
        });
      });
    });
  })
})

// @route POST api/user/logout
// @desc Logout
// @access Public
router.post("/logout", authMiddleware, (req, res) => {
  const token = req.header("auth-token");
  ValidToken.findOneAndDelete({token}).exec();
  res.status(200)
    .json({
      status: 200,
      msg: "Logout success"
  });
})

module.exports = router;
