const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const normalize = require('normalize-url');

//@route    GET api/profile/me
//@desc     Get current user's profile
//@access   Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res
        .status(400)
        .json({ errors: { msg: 'Profile does not exist' } });
    }

    res.json({ profile });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    const profileFields = {
      user: req.user.id,
      company,
      location,
      website,
      bio,
      skills: Array.isArray(skills)
        ? skills
        : skills.split(',').map((skill) => ' ' + skill.trim()),
      status,
      githubusername,
    };

    // Build social object and add to profileFields
    const socialfields = { youtube, twitter, instagram, linkedin, facebook };

    for (const [key, value] of Object.entries(socialfields)) {
      if (value && value.length > 0)
        socialfields[key] = normalize(value, { forceHttps: true });
    }
    profileFields.social = socialfields;

    try {
      // Using upsert option (creates new doc if no match is found):
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true }
      );
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route  GET api/profile
//@desc   Get all profiles
//@access Public
router.get('/', async (req, res) => {
  try {
    const profile = await Profile.find().populate('user', ['name', 'avatar']);
    if (profile) {
      res.send(profile);
    } else {
      res.send('No profiles');
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  GET api/profile/user/:user_id
//@desc   Get Profile by user id
//@access Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await (
      await Profile.findOne({ user: req.params.user_id })
    ).populate('user', ['name', 'avatar']);

    if (profile) {
      res.send(profile);
    } else {
      res.status(400).send('No profile found');
    }
  } catch (err) {
    console.error(err.message);
    if (err.kind == 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server Error');
  }
});

//@route  DELETE api/profile
//@desc   delete Profile, user and posts
//@access Private
router.delete('/', auth, async (req, res) => {
  try {
    //Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Remove User
    await User.findOneAndRemove({ _id: req.user.id });

    res.send('User Deleted');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
