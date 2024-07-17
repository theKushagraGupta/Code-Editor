import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import User from "D:/Academics/Metis Code Editor/code-editor/src/compnents/User.js";
import Editor from "D:/Academics/Metis Code Editor/code-editor/src/compnents/Editor.js";
import ACTIONS from "../Actions";
import { initSocket } from "../Socket";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";

const CodeEditorPage = () => {
  const socketRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomID } = useParams();

  const [users, setUsers] = useState([]);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("Socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomID,
        username: location.state?.username,
      });

      // Listening for joined event
      socketRef.current.on(ACTIONS.JOINED, ({ users, username, socketID }) => {
        if (username !== location.state?.username) {
          // Except the newly joining user, notify all others
          toast.success(`${username} has joined the room!`);
        }
        setUsers((prevUsers) => {
          // Check if the user already exists in the state
          const userExists = prevUsers.some(
            (user) => user.socketID === socketID
          );
          if (!userExists) {
            return [...prevUsers, { username, socketID }];
          }
          return prevUsers;
        });
      });
    };
    init();
  }, [location.state?.username, reactNavigator, roomID]);

  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrapper">
      <div className="sidePanelWrapper">
        <div className="sidePanelTop">
          <div className="logo">
            <img className="logoImage" src="/CollabImage.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="userList">
            {users.map((user) => (
              <User key={user.socketID} username={user.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn">Copy Room ID</button>
        <button className="btn leaveBtn">Leave Room</button>
      </div>
      <div className="editorWrapper">
        <Editor />
      </div>
    </div>
  );
};

export default CodeEditorPage;
