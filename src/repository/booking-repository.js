const { StatusCodes } = require('http-status-codes');

const { Booking } = require('../models/index');
const { AppError, ValidationError } = require('../utils/errors/index');

class BookingRepository {
    async create(data) {
        try {
            const booking = await Booking.create(data);
            return booking;
        } catch (error) {
            if(error.name == 'SequelizeValidationError') {
                throw new ValidationError(error);
            }
            throw new AppError(
                'RepositoryError', 
                'Cannot create Booking', 
                'There was some issue creating the booking, please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    // To set status as Booked
    async update(bookingId, data) {
        try {
            const booking = await Booking.findByPk(bookingId);
            if(data.status) {
                booking.status = data.status;
            }
            await booking.save();
            return booking;
        } catch (error) {
            throw new AppError(
                'RepositoryError', 
                'Cannot update Booking', 
                'There was some issue updating the booking, please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    // Get booking details by ID
    async getAll(filters = {}) {
        try {
            const whereClause = {};
            
            // Add filters if provided
            if (filters.status) {
                whereClause.status = filters.status;
            }
            if (filters.flightId) {
                whereClause.flightId = filters.flightId;
            }
            if (filters.userId) {
                whereClause.userId = filters.userId;
            }

            const bookings = await Booking.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']]
            });
            return bookings;
        } catch (error) {
            throw new AppError(
                'RepositoryError',
                'Cannot fetch bookings',
                'There was some issue fetching the bookings',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getBooking(bookingId) {
        try {
            const booking = await Booking.findOne({
                where: {
                    id: bookingId
                }
            });
            if (!booking) {
                throw new AppError(
                    'NotFoundError',
                    'Booking not found',
                    'The booking with the provided ID does not exist',
                    StatusCodes.NOT_FOUND
                );
            }
            return booking;
        } catch (error) {
            throw new AppError(
                'RepositoryError',
                'Cannot get Booking',
                'There was some issue fetching the booking details',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    //To delete a Booking
    async deleteBooking(bookingId, data) {
        try {
            // Fetch the booking first
            const booking = await Booking.findOne({
                where: {
                    id: bookingId,
                }
            });

            if (!booking) {
                throw new AppError(
                    'NotFoundError',
                    'Booking Not Found',
                    'The booking you are trying to delete does not exist',
                    StatusCodes.NOT_FOUND);
            }

            // Update the status if provided
            if (data.status) {
                booking.status = data.status;
                await booking.save();
            }

            // Can be implemented for Other Applications Where Prev Bookings Data is not necessary
            // // Delete the booking
            await Booking.destroy({
                where: {
                    id: bookingId,
                }
            });

            return booking; // Return the booking details that were deleted
        } catch (error) {
            throw new AppError(
                'RepositoryError',
                'Cannot Delete Booking',
                'There was some issue Deleting the booking, please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    
    async getBooking(bookingId) {
        try {
            const booking = await Booking.findByPk(bookingId);
            return booking;
        } catch (error) {
            throw new AppError(
                'RepositoryError', 
                'Cannot Fetch Booking', 
                'There was some issue Fetch the booking, please try again later',
                StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}

module.exports = BookingRepository;