import React, {useEffect, useState} from 'react';
import './App.css';

import {Auth, Hub} from 'aws-amplify';

const initialFormState = {
  username: '',
  password: '',
  email: '',
  authCode: '',
  formType: 'signUp'
};

function App() {
  const [formState, updateFormState] = useState(initialFormState);
  const [user, updateUser] = useState(null);

  useEffect(() => {
    checkUser().then(r => console.log(r));
    setAuthListener().then(r => console.log(r));
  });

  async function setAuthListener() {
    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signOut':
          console.log('data: ', data);
          updateFormState(() => ({...formState, formType: "signUp"}));
          break;
        default:
          break;
      }
    });
  }

  async function checkUser() {
    try {
      const user = await Auth.currentAuthenticatedUser()
      console.log('user', user);
      updateUser(user);
      updateFormState(() => ({...formState, formType: "signedIn"}));
    } catch (e) {

    }
  }

  function onChange(e) {
    e.persist();
    updateFormState(() => ({...formState, [e.target.name]: e.target.value}));
  }

  const {formType} = formState;

  async function singUp() {
    const {username, email, password} = formState
    await Auth.signUp({username, password, attributes: {email}})
    updateFormState(() => ({...formState, formType: "confirmSignUp"}));
  }

  async function confirmSignUp() {
    const {username, authCode} = formState
    await Auth.confirmSignUp(username, authCode);
    updateFormState(() => ({...formState, formType: "signIn"}));
  }

  async function signIn() {
    const {username, password} = formState
    await Auth.signIn(username, password);
    updateFormState(() => ({...formState, formType: "signedIn"}));
  }

  return (
    <div className="App">
      {
        formType === 'signUp' && (
          <div>
            <input name="username" onChange={onChange} placeholder="username"/>
            <input name="password" type="password" onChange={onChange}
                   placeholder="password"/>
            <input name="email" onChange={onChange} placeholder="email"/>
            <button onClick={singUp}>Sign Up</button>
            <button onClick={() => updateFormState(() => ({
              ...formState, formType: 'signIn'
            }))}>Sign In
            </button>
          </div>
        )
      }
      {
        formType === 'confirmSignUp' && (
          <div>
            <input name="authCode" onChange={onChange}
                   placeholder="Confirmation code"/>
            <button onClick={confirmSignUp}>Confirm Sign Up</button>
          </div>
        )
      }
      {
        formType === 'signIn' && (
          <div>
            <input name="username" onChange={onChange} placeholder="username"/>
            <input name="password" type="password" onChange={onChange}
                   placeholder="password"/>
            <button onClick={signIn}>Sign In</button>
          </div>
        )
      }
      {
        formType === 'signedIn' && (
          <div>
            <div>
              <h1>Welcome {user.username}</h1>
              <button onClick={
                () => Auth.signOut()
              }>Sign out
              </button>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default App;
