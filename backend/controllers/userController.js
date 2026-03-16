const crypto = require('crypto');
const User = require('../models/user');

function diceBearUrl(seed) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Backfill avatarSeed for legacy users
    if (!user.avatarSeed) {
      user.avatarSeed = crypto.randomBytes(6).toString('hex');
      await user.save();
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatarSeed: user.avatarSeed,
      avatarUrl: diceBearUrl(user.avatarSeed),
      totalScore: user.totalScore,
      highScore: user.highScore,
      gamesPlayed: user.gamesPlayed,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    console.error('❌ getMe error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

exports.submitGameResult = async (req, res) => {
  const { score } = req.body;
  if (typeof score !== 'number') {
    return res.status(400).json({ message: 'Score must be a number' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.totalScore += score;
    user.gamesPlayed += 1;
    if (score > user.highScore) user.highScore = score;

    await user.save();

    res.json({
      totalScore: user.totalScore,
      highScore: user.highScore,
      gamesPlayed: user.gamesPlayed,
    });
  } catch (error) {
    console.error('❌ submitGameResult error:', error);
    res.status(500).json({ message: 'Server error submitting game result' });
  }
};

exports.rerollAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.avatarSeed = crypto.randomBytes(6).toString('hex');
    await user.save();

    res.json({ avatarSeed: user.avatarSeed, avatarUrl: diceBearUrl(user.avatarSeed) });
  } catch (error) {
    console.error('❌ rerollAvatar error:', error);
    res.status(500).json({ message: 'Server error updating avatar' });
  }
};
