import React, { useContext, useEffect, useState } from 'react'
import './LeftSideBar.css'
import assets from '../../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '../../config/firebase.js'
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore'
import { AppContext } from '../../context/AppContext.jsx'
import { toast } from 'react-toastify'
import { signOut } from 'firebase/auth'
/* best practice to add file extension for assets.js */

const LeftSideBar = () => {

  const navigate = useNavigate();
  const { userData, chatData, chatUser, setChatUser, setMessagesId, messagesId, chatVisible, setChatVisible } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, 'users');
        const q = query(userRef, where('username', '>=', input.toLowerCase()), where('username', '<=', input.toLowerCase() + '\uf8ff'));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false;
          chatData.map((User) => {
            if (user && user.rId === querySnap.docs[0].data().id) {
              userExist = true;
            }
          })
          if (!userExist) {
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null);
        }
        // i defined and declared uniqueUsers to store the unique users. matchingUsers was pushed into it
        const uniqueUsers = [];
        const matchingUsers = querySnap.docs
          .map(doc => doc.data())
          .filter(user => user.id !== userData.id);
        uniqueUsers.push(...matchingUsers);
        setUsers(uniqueUsers);
      } else {
        setShowSearch(false);
        setUser(null);
        setUsers([]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const addChat = async (selectedUser) => {
    const messagesRef = collection(db, 'messages');
    const chatsRef = collection(db, 'chats');
    try {
      const newMessageRef = doc(messagesRef);
      await setDoc(newMessageRef, {
        createAt: serverTimestamp(),
        messages: []
      });
      await updateDoc(doc(chatsRef, userData.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: '',
          rId: selectedUser.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });
      await updateDoc(doc(chatsRef, selectedUser.id), {
        chatsData: arrayUnion({
          messageId: newMessageRef.id,
          lastMessage: '',
          rId: userData.id,
          updatedAt: Date.now(),
          messageSeen: true,
        }),
      });

      const uSnap = await getDoc(doc(db, 'users', user.id));
      const uData = uSnap.data();
      setChat({
        messagesId: newMessageRef.id,
        lastMessage: '',
        rId: user.id,
        updatedAt: Date.now(),
        messageSeen: true,
        userData: uData,
      });
      setShowSearch(false);
      setChatVisible(true);
      toast.success('Chat created successfully');

    } catch (error) {
      toast.error(error.message);
      console.error(error);
    }
  }

  const setChat = async (item) => {
    try {
      setMessagesId(item.messageId);
      setChatUser(item);
      const userChatsRef = doc(db, 'chats', userData.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      const userChatsData = userChatsSnapshot.data();
      console.log(userChatsData);
      const chatIndex = userChatsData.chatsData.findIndex((c) => c.messageId === item.messageId);
      userChatsData.chatsData[chatIndex].messageSeen = true;
      await updateDoc(userChatsRef, {
        chatsData: userChatsData.chatsData
      })
      setChatVisible(true);
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {

    const updateChatUserData = async () => {

      if (chatUser) {
        const userRef = doc(db, 'users', chatUser.userData.id);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        setChatUser(prev => ({ ...prev, userData: userData }));
      }
    }
    updateChatUserData();
  }, [chatData]);

  return (
    <div className={`ls ${chatVisible ? 'hidden' : ''}`} >
      {<div className='ls-top'>
        <div className="ls-nav">
          <img src={assets.logo} alt="logo" className="logo" />
          <div className="menu">
            <img src={assets.menu_icon} alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate('/profile')}>Edit Profile</p>
              <hr />
              <p onClick={() => signOut(auth)}>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} alt="" />
          <input onChange={inputHandler} type="text" placeholder='Search here, bro' />
        </div>
      </div>}
      <div className="ls-list">
        {showSearch && users.length > 0
          ? (users.map((user, index) => (
            <div onClick={() => addChat(user)} key={index} className="friends add-user">
              <img src={user.avatar} alt="" />
              <p>{user.username}</p>
            </div>
          )))
          : (Array.isArray(chatData) && chatData.length > 0 ? (
            chatData
              .filter((item, index, self) =>
                index === self.findIndex((t) => t.userData.id === item.userData.id)
              )
              .map((item, index) => (
                <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId ? '' : 'border'}`}>
                  <img src={item?.userData?.avatar || assets.profile_img} alt="" />
                  <div>
                    <p>{item?.userData?.name || 'User'}</p>
                    <span>{item?.lastMessage || 'No messages yet'}</span>
                  </div>
                </div>
              )))
            : (<div className="no-chats">
              <p>No chats available</p>
            </div>
            )
          )}
      </div>
    </div>
  )
}

export default LeftSideBar