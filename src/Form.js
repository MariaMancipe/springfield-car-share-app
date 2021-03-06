import React, { useState, useReducer } from 'react'

import { Auth } from 'aws-amplify'

const initialFormState = {
  username: '', password: '', email: '', confirmationCode: '', name: '',
}

function reducer(state, action) {
  switch(action.type) {
    case 'updateFormState':
      return {
        ...state, [action.e.target.name]: action.e.target.value
      }
    default:
      return state
  }
}

async function signUp({ username, password, email, name }, updateFormType) {
  try {
    await Auth.signUp({
      username, password, attributes: {email, name}
    })
    console.log('sign up success!')
    updateFormType('confirmSignUp')
  } catch (err) {
    console.log('error signing up..', err)
  }
}

async function confirmSignUp({ username, confirmationCode }, updateFormType) {
  try {
    await Auth.confirmSignUp(username, confirmationCode)
    console.log('confirm sign up success!')
    updateFormType('signIn')
  } catch (err) {
    console.log('error signing up..', err)
  }
}

async function signIn({ username, password }) {
  try {
    await Auth.signIn(username, password)
    console.log('sign in success!')
  } catch (err) {
    console.log('error signing up..', err)
  }
}

export default function Form() {
  const [formType, updateFormType] = useState('signUp')
  const [formState, updateFormState] = useReducer(reducer, initialFormState)
  function renderForm() {
    switch(formType) {
      case 'signIn':
        return (
          <SignIn
            signIn={() => signIn(formState)}
            updateFormState={e => updateFormState({ type: 'updateFormState', e })}
          />
        )
      case 'signUp':
        return (
          <SignUp
            signUp={() => signUp(formState, updateFormType)}
            updateFormState={e => updateFormState({ type: 'updateFormState', e })}
          />
        )
      case 'confirmSignUp':
        return (
          <ConfirmSignUp
            confirmSignUp={() => confirmSignUp(formState, updateFormType)}
            updateFormState={e => updateFormState({ type: 'updateFormState', e })}
          />
        )
      default:
        return null
    }
  }
  

  return (
    <div>
      <div>
        {renderForm(formState)}
      </div>
      {
        formType === 'signUp' && (
          <p style={styles.footer}>
            Already have an account?<span
              style={styles.anchor}
              onClick={() => updateFormType('signIn')}
            >Sign In</span>
          </p>
        )
      }
      {
        formType === 'signIn' && (
          <p style={styles.footer}>
            Need an account?<span
              style={styles.anchor}
              onClick={() => updateFormType('signUp')}
            >Sign Up</span>
          </p>
        )
      }
    </div>
  )
}

function SignUp(props) {
  return (
      
    <div style={styles.container}>
     <h2 style={styles.signheader}>
          Create Account
      </h2>
      <input 
        name='Name'
        onChange={e => {e.persist();props.updateFormState(e)}}
        style={styles.input}
        placeholder='Name'
      />
      <input 
        name='username'
        onChange={e => {e.persist();props.updateFormState(e)}}
        style={styles.input}
        placeholder='user email'
      />
      <input
        type='password'
        name='password'
        onChange={e => {e.persist();props.updateFormState(e)}}
        style={styles.input}
        placeholder='password'
      />
      <input 
         name='email'
         onChange={e => {e.persist();props.updateFormState(e)}}
         style={styles.input}
         placeholder='email'
       />
      
      <button onClick={props.signUp} style={styles.button}>
        Sign Up 
      </button>
    </div>
  )
}

function SignIn(props) {
  return (
    <div style={styles.container}>
      <h2 style={styles.signheader}>
          Sign In
      </h2>
      <input 
        name='username'
        onChange={e => {e.persist();props.updateFormState(e)}}
        style={styles.input}
        placeholder='username'
      />
      <input
        type='password'
        name='password'
        onChange={e => {e.persist();props.updateFormState(e)}}
        style={styles.input}
        placeholder='password'
      />
      <button style={styles.button} onClick={props.signIn}>
        Sign In
      </button>
    </div>
  )
}

function ConfirmSignUp(props) {
  return (
    <div style={styles.container}>
      <input
        name='confirmationCode'
        placeholder='Confirmation Code'
        onChange={e => {e.persist();props.updateFormState(e)}}
        style={styles.input}
      />
      <button onClick={props.confirmSignUp} style={styles.button}>
        Confirm Sign Up
      </button>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 150,
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    height: 45,
    marginTop: 8,
    width: 300,
    maxWidth: 300,
    padding: '0px 8px',
    fontSize: 16,
    outline: 'none',
    border: 'none',
    borderBottom: '2px solid rgba(0, 0, 0, .3)'
  },
  button: {
    //backgroundColor: '#006bfc',
    backgroundColor: '#FF9900',
    color: 'white',
    width: 316,
    height: 45,
    marginTop: 10,
    fontWeight: '600',
    fontSize: 14,
    cursor: 'pointer',
    border:'none',
    outline: 'none',
    borderRadius: 3,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, .3)',
  },
  footer: {
    fontWeight: '600',
    padding: '0px 25px',
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.6)'
  },
  anchor: {
    color: '#006bfc',
    cursor: 'pointer'
  },
  signheader: {
    fontWeight: '600',
    padding: '0px 0px',
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.6)',
    fontSize: '20px'
    
  }
}
