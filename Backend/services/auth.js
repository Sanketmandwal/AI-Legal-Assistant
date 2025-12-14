import jwt from 'jsonwebtoken'

function createtokenforuser(user){
    const payload={
        _id:user._id,
        email:user.email,
        role:user.role,
    }

    const token=jwt.sign(payload,process.env.JWT_SECRET);
    return token;
}

function validatetoken(token){
    const payload=jwt.verify(token,process.env.JWT_SECRET);
    return payload;
}

export {createtokenforuser,validatetoken};