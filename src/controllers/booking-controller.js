const { StatusCodes } = require('http-status-codes');

const { BookingService } = require('../services/index');

const { createChannel, publishMessage } = require('../utils/messageQueue');
const { REMINDER_BINDING_KEY } = require('../config/serverConfig');

const bookingService = new BookingService();

class BookingController {

    constructor() {
    }

    async sendMessageToQueue(req, res){
        const channel = await createChannel();
        const payload = {
            data: {
                subject: 'This is a Ticket from Queue',
                content: 'This is some content sent in an email',
                recepientEmail: 'notificationservice12345@gmail.com',
                notificationTime: '2024-06-15T11:40:00.000'
            },
            service: 'CREATE_TICKET'
        };
        publishMessage(channel, REMINDER_BINDING_KEY, JSON.stringify(payload));
        return res.status(200).json({
            message: 'Succesfully published the event'
        });
    }

    async getAll(req, res) {
        try {
            const filters = req.query;
            const bookings = await bookingService.getAllBookings(filters);
            return res.status(StatusCodes.OK).json({
                message: 'Successfully fetched bookings',
                success: true,
                err: {},
                data: bookings
            });
        } catch (error) {
            return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
                message: error.message,
                success: false,
                err: error.explanation,
                data: {}
            });
        }
    }

    async create (req, res) {
        try {
            const response = await bookingService.createBooking(req.body);
            // console.log("FROM BOOKING CONTROLLER", response);
            return res.status(StatusCodes.OK).json({
                message: 'Successfully completed booking',
                success: true,
                err: {},
                data: response
            })
        } catch (error) {
            return res.status(error.statusCode).json({
                message: error.message,
                success: false,
                err: error.explanation,
                data: {}
            });
        }
    }

    async destroy (req, res) {
        try {
            const response = await bookingService.deleteBooking(req.body);
            // console.log("FROM BOOKING CONTROLLER", response);
            return res.status(StatusCodes.OK).json({
                message: 'Successfully Deleted booking',
                success: true,
                err: {},
                data: response
            })
        } catch (error) {
            return res.status(error.statusCode).json({
                message: error.message,
                success: false,
                err: error.explanation,
                data: {}
            });
        }
    }
}

module.exports = BookingController