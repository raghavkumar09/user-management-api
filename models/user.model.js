import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';
const schema = mongoose.Schema;

const userSchema = schema({
    name:{
        type: String,
        require: true
    },
    email:{
        type: String,
        require: true,
        unique: true
    },
    password:{
        type: String,
        require: [true, 'Password is required']
    },
    address:{
        type: String,
        require: true
    },
    latitude:{
        type: Number,
        require: true
    },
    longitude:{
        type: Number,
        require: true
    },
    status:{
        type: Boolean,
        default: true
    },
    register_at:{
        type: Date,
        default: Date.now(),
        index: true
    }
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email
        }, process.env.JWT_SECRET
    )
}

const User = mongoose.model('User', userSchema);
export default User;
