const Event = require('../models/Event');

const createEvent = async (req, res) => {
    console.log("--- CREATE EVENT ROUTE HIT ---");
    console.log("Body:", req.body);
    console.log("File:", req.file);
    const { eventName, eventDescription, eventDate, time, eventLocation, category } = req.body;
    try {
        // Normalize path to use forward slashes (fixes Windows backslash issue)
        const bannerPath = req.file ? req.file.path.replace(/\\/g, '/') : null;
        const event = await Event.create({
            eventName,
            eventDescription,
            eventDate,
            time,
            eventLocation,
            category,
            bannerImage: bannerPath,
            status: req.user.role === 'admin' ? 'Approved' : 'Pending',
            createdBy: req.user._id
        });
        res.status(201).json(event);
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getEvents = async (req, res) => {
    try {
        const query = (req.user.role === 'admin' || req.user.role === 'host') ? {} : { createdBy: req.user._id };
        const events = await Event.find(query).populate('createdBy', 'name');
        res.json(events);
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name')
            .populate('bookedPhotographer', 'name email phone profilePhoto experience portfolioPhotos rating')
            .populate('photographersApplied.photographer', 'name email phone profilePhoto experience portfolioPhotos rating');
            
        if (event) {
            // Owner, admin, or any photographer can view event details if it's approved
            if (
                event.createdBy._id.toString() !== req.user._id.toString() && 
                req.user.role !== 'admin' &&
                !(req.user.role === 'photographer' && event.status === 'Approved')
            ) {
                return res.status(403).json({ message: 'Not authorized to view this event' });
            }
            res.json(event);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateEvent = async (req, res) => {
    const { eventName, eventDescription, eventDate, eventLocation, category } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            // Only owner or admin can update
            if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to update this event' });
            }
            event.eventName = eventName || event.eventName;
            event.eventDescription = eventDescription || event.eventDescription;
            event.eventDate = eventDate || event.eventDate;
            event.eventLocation = eventLocation || event.eventLocation;
            event.category = category || event.category;
            if (req.file) {
                event.bannerImage = req.file.path.replace(/\\/g, '/');
            }
            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            // Only owner or admin can delete
            if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to delete this event' });
            }
            await event.deleteOne(); // Use deleteOne instead of deprecated remove()
            res.json({ message: 'Event removed' });
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateEventStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const event = await Event.findById(req.params.id);
        if (event) {
            event.status = status;
            const updatedEvent = await event.save();
            res.json(updatedEvent);
        } else {
            res.status(404).json({ message: 'Event not found' });
        }
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Fetch events created by the current user
const getUserEvents = async (req, res) => {
    try {
        const userId = req.user._id;
        const events = await Event.find({ createdBy: userId })
            .populate('createdBy', 'name')
            .populate('bookedPhotographer', 'name');
        res.json(events);
    } catch (error) {
        console.error('Get User Events Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Photographer specific: Get all approved events they can apply to or have applied to
const getApprovedEvents = async (req, res) => {
    try {
        // Find all approved events
        const events = await Event.find({ status: 'Approved' })
            .populate('createdBy', 'name')
            .populate('bookedPhotographer', 'name');
        res.json(events);
    } catch (error) {
        console.error('Get Approved Events Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Photographer specific: Apply for an event
const applyForEvent = async (req, res) => {
    try {
        if (req.user.role !== 'photographer') {
            return res.status(403).json({ message: 'Only photographers can apply for events' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.status !== 'Approved') {
            return res.status(400).json({ message: 'Cannot apply to unapproved events' });
        }

        // Check if already applied
        const alreadyApplied = event.photographersApplied.find(
            app => app.photographer.toString() === req.user._id.toString()
        );

        if (alreadyApplied) {
            return res.status(400).json({ message: 'Already applied for this event' });
        }

        event.photographersApplied.push({ photographer: req.user._id, status: 'Pending' });
        await event.save();

        res.json({ message: 'Successfully applied for event', event });
    } catch (error) {
        console.error('Apply for Event Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Host specific: Select a photographer
const selectPhotographer = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Only owner can select
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to manage this event' });
        }

        const photographerId = req.body.photographerId;
        
        // Find application
        const application = event.photographersApplied.find(
            app => app.photographer.toString() === photographerId
        );

        if (!application) {
            return res.status(404).json({ message: 'Photographer has not applied for this event' });
        }

        // Update selected photographer status
        application.status = 'Booked';
        
        // Update all other pending applications to Not Selected
        event.photographersApplied.forEach(app => {
            if (app.photographer.toString() !== photographerId && app.status === 'Pending') {
                app.status = 'Not Selected';
            }
        });

        // Set booked photographer
        event.bookedPhotographer = photographerId;

        await event.save();
        res.json({ message: 'Photographer selected successfully', event });

    } catch (error) {
        console.error('Select Photographer Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Host specific: Reject a photographer
const rejectPhotographer = async (req, res) => {
     try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Only owner can reject
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to manage this event' });
        }

        const photographerId = req.body.photographerId;
        
        // Find application
        const application = event.photographersApplied.find(
            app => app.photographer.toString() === photographerId
        );

        if (!application) {
            return res.status(404).json({ message: 'Photographer has not applied for this event' });
        }

        application.status = 'Not Selected';
        await event.save();

        res.json({ message: 'Photographer rejected successfully', event });

    } catch (error) {
        console.error('Reject Photographer Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent, updateEventStatus, getUserEvents, getApprovedEvents, applyForEvent, selectPhotographer, rejectPhotographer };
