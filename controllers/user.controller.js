import 'dotenv/config'
import User from "../models/user.model.js";
import haversine from 'haversine';

// Create User
async function createUser(req, res) {
    try {
        const { name, email, password, address, latitude, longitude } = req.body;

        if([name, email, password, address, latitude, longitude].includes('')) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "All fields are required"
            })
        }

        // Validate name (e.g., ensure it's at least 3 characters long)
        if (typeof name !== 'string' || name.length < 3) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Name must be at least 3 characters long"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Invalid email format"
            });
        }

        const existingUser = await User.findOne({
            email: email
        })

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already available"
            })
        }

        const newUser = await User.create({
            name: name,
            email: email,
            password: password,
            address: address,
            latitude: latitude,
            longitude: longitude
        })

        const checkUser = await User.findOne(newUser._id);
        if (!checkUser) {
            return res.status(500).send("Internal server error")
        }

        console.log(checkUser)

        const token = checkUser.generateToken();

        return res.status(200).json({
            status_code: 200,
            message: 'User created successfully',
            data: {
                name: newUser.name,
                email: newUser.email,
                address: newUser.address,
                latitude: newUser.latitude,
                longitude: newUser.longitude,
                status: newUser.status,
                register_at: newUser.register_at,
                token,
            },
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

// Change Users Status
async function changeUserStatus(req, res) {
    try {
        await User.updateMany({}, [
            { $set: { status: { $eq: [false, '$status'] } } },
        ]);

        return res
            .status(200)
            .cookie("token",)
            .json({
            status_code: 200,
            message: 'User statuses updated successfully',
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Distance
async function getDistance(req, res) {
    try {
        const { destination_latitude, destination_longitude } = req.body;
        if (!destination_latitude || !destination_longitude) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "All fields are required"
            });
        }

        const user = await User.findById(req.user._id);

        // Define the start and end coordinates
        const start = { latitude: user.latitude, longitude: user.longitude };
        const end = { latitude: destination_latitude, longitude: destination_longitude };

        // Calculate the distance
        const distance = haversine(start, end, { unit: 'km' });

        res.status(200).json({
            status_code: 200,
            message: 'Distance calculated successfully',
            distance: `${distance.toFixed(2)} km`,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Get User Listing
async function getUserListing(req, res) {
    try {
        const { week_number } = req.query;

        if (!week_number) {
            return res.status(400).json({
                status_code: '400',
                message: 'week_number is required',
                data: {}
            });
        }

        const weekNumbers = week_number.split(',').map(Number);

        let isValid = true;
        for (const num of weekNumbers) {
            if (num < 0 || num > 6) {
                isValid = false;
                break;
            }
        }

        if (!isValid) {
            return res.status(400).json({
                status_code: '400',
                message: 'Invalid week_number provided. Should be between 0 (Sunday) and 6 (Saturday).',
                data: {}
            });
        }

        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

        const users = await User.aggregate([
            {
                $project: {
                    name: 1,
                    email: 1,
                    register_at: 1,
                    dayOfWeek: { $dayOfWeek: '$register_at' }
                }
            },
            {
                $match: {
                    dayOfWeek: { $in: weekNumbers.map(day => day + 1) }
                }
            },
            {
                $group: {
                    _id: '$dayOfWeek',
                    users: { $push: { name: '$name', email: '$email' } }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]); 

        // Construct the result object with correct keys
        const result = {};
        for (const dayIndex of weekNumbers) {
            const dayName = daysOfWeek[dayIndex];
            console.log(dayIndex)
            console.log(dayName)
            result[dayName] = (users.find(userGroup => userGroup._id === dayIndex + 1) || 
            { users: [] }).users;
        }

        return res.status(200).json({
            status_code: '200',
            message: 'User listing retrieved successfully',
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            status_code: '500',
            message: 'Internal server error',
            data: {},
            error: error.message,
        });
    }
};

export { createUser, changeUserStatus, getDistance, getUserListing }