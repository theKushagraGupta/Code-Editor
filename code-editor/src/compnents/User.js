import React from 'react'
import Avatar from 'react-avatar'

const User = ({username}) => {
  return (
    <div className = "user">
        <Avatar name = {username} size = {50} round = "15px"/>
        <span className = "userName">
            {username }
        </span>
      
    </div>
  )
}

export default User
