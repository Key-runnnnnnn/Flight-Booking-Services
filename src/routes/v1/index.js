const express = require('express');

const {BookingController} = require('../../controllers/index');
const bookingController = new BookingController();
const router = express.Router();

router.get('/info', (req, res) => {
    return res.json({ message: 'Hitting Booking Service' });
  });
router.post('/bookings', bookingController.create);
router.delete('/bookings', bookingController.destroy);
router.post('/publish', bookingController.sendMessageToQueue);

module.exports = router;