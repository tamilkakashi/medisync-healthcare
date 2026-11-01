try {
    const User = require('./models/User');
    const Notification = require('./models/Notification');
    const authController = require('./controllers/authController');
    const hospitalController = require('./controllers/hospitalController');
    console.log('SUCCESS: All models and controllers loaded correctly.');
} catch (error) {
    console.error('FAILURE: Error loading modules:');
    console.error(error);
    process.exit(1);
}
