const axios = require('axios');
const { StatusCodes } = require('http-status-codes');

const { BookingRepository } = require('../repository/index');
const { FLIGHT_SERVICE_PATH, BOOKING_SERVICE_PATH } = require('../config/serverConfig');
const { ServiceError } = require('../utils/errors');

class BookingService {
    constructor() {
        this.bookingRepository = new BookingRepository();
    }

    async createBooking(data) {
        try {
            const flightId = data.flightId;
            console.log("Flight ID", flightId);
            const getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const response = await axios.get(getFlightRequestURL);
            const flightData = response.data.data;
            let priceOfTheFlight = flightData.price;
            console.log("noOfSeats", data.noOfSeats);
            if(data.noOfSeats > flightData.totalSeats) {
                throw new ServiceError('Something went wrong in the booking process', 'Insufficient seats in the flight');
            }
            const totalCost = priceOfTheFlight * data.noOfSeats;
            const bookingPayload = {...data, totalCost};
            const booking = await this.bookingRepository.create(bookingPayload);
            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}`;
            // console.log(updateFlightRequestURL);
            console.log("Booking Data", booking.data);
            await axios.patch(updateFlightRequestURL, {totalSeats: flightData.totalSeats - booking.noOfSeats});
            const finalBooking = await this.bookingRepository.update(booking.id, {status: "Booked"});
            return finalBooking;
        } catch (error) { 
            console.log(error);
            if(error.name == 'RepositoryError' || error.name == 'ValidationError') {
                throw error;
            }
            throw new ServiceError();
        }
    }

    async getAllBookings(filters = {}) {
        try {
            const bookings = await this.bookingRepository.getAll(filters);
            return bookings;
        } catch (error) {
            console.error('Error in getAllBookings:', error);
            throw new ServiceError('Failed to fetch bookings', error.message);
        }
    }

    async deleteBooking(data) {
        try {
            if (!data.bookingId) {
                throw new ServiceError('Invalid request', 'Booking ID is required');
            }

            const BookingId = data.bookingId;
            const bookingDetails = await this.bookingRepository.getBooking(BookingId);
            
            if (!bookingDetails) {
                throw new ServiceError('Booking not found', 'The booking with the provided ID does not exist');
            }

            const SeatsBooked = bookingDetails.noOfSeats;
            const flightId = bookingDetails.flightId;
            const getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const response = await axios.get(getFlightRequestURL);
            const FlightData = response.data.data;

            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            await axios.patch(updateFlightRequestURL, {totalSeats: FlightData.totalSeats + SeatsBooked});
            const finalBooking = await this.bookingRepository.deleteBooking(BookingId, {status: "Cancelled"});
            return finalBooking;
        } catch (error) { 
            console.error('Error in deleteBooking:', error);
            if (error.name === 'ServiceError' || error.name === 'RepositoryError' || error.name === 'ValidationError') {
                throw error;
            }
            throw new ServiceError('Internal server error', error.message || 'Failed to cancel booking');
        }
    }
}

module.exports = BookingService;