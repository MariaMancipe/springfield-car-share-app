import React, { useReducer, useEffect, useState } from 'react';
import './App.css'

import Buttons from './Buttons';
import Form from './Form'
import Header from './Header'

import { Hub, Auth } from 'aws-amplify'
import { FaSignOutAlt, BiData} from 'react-icons/fa'
import {API} from 'aws-amplify'
import Amplify from 'aws-amplify'
import awsmobile from './aws-exports'

import jwt from 'jwt-decode'

Amplify.configure(awsmobile);
API.configure(awsmobile);

const initialUserState = { user: null, loading: true }


function App() {

  const [userState, dispatch] = useReducer(reducer, initialUserState)
  const [formState, updateFormState] = useState('base')
  const [allJourneys,setAllJourneys]=useState([]);
  const [userJourneys,setUserJourneys]=useState([]);
  const [weather,setWeather]=useState({});
  
  useEffect(() => {
    // set listener for auth events
    Hub.listen('auth', (data) => {
      const { payload } = data
      if (payload.event === 'signIn') {
        setImmediate(() => dispatch({ type: 'setUser', user: payload.data }))
        updateFormState('base')
      }
      // this listener is needed for form sign ups since the OAuth will redirect & reload
      if (payload.event === 'signOut') {
        setTimeout(() => dispatch({ type: 'setUser', user: null }), 350)
      }
    })
    // we check for the current user unless there is a redirect to ?signedIn=true 
    if (!window.location.search.includes('?signedin=true')) {
      checkUser(dispatch)
    }
  }, [])

  // This renders the custom form
  if (formState === 'email') {
    return (
      <div style={styles.appContainer}>
        <Header updateFormState={updateFormState} />
        <Form />
      </div>
      )
  }

  async function getAllJourneys(){
    const user = await Auth.currentAuthenticatedUser()
    //console.log(user)
    const token = user.signInUserSession.idToken.jwtToken
    const access_token = user.signInUserSession.accessToken.jwtToken
    console.log("identity token:")
    console.log({token})
    console.log("access token:")
    console.log({access_token})
    const token_info = jwt(token);
    console.log(token_info)
    const requestInfo = {headers:{Authorization:`Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`}}
    
    var response = await API.get('car-share','/journeys',requestInfo)
    setAllJourneys(response)
  }

  async function getUserJourneys(){
    const user = await Auth.currentAuthenticatedUser()
    //console.log(user)
    const token = user.signInUserSession.idToken.jwtToken
    const access_token = user.signInUserSession.accessToken.jwtToken
    console.log("identity token:")
    console.log({token})
    console.log("access token:")
    console.log({access_token})
    const username = user.username
    const requestInfo = {headers:{Authorization:token}}
    var response = await API.get('car-share',`/journeys/${username}`,requestInfo)
    setUserJourneys(response)
  }

  async function getWeatherInformation(){
    var response = await API.get('car-share','/third-party/gridpoints/LWX/96,70/forecast')
    setWeather(response.properties.periods[0])
    console.log(response)
  }



  return (
    <div style={styles.appContainer}>
      <Header updateFormState={updateFormState} />
      {
        userState.loading && (
          <div style={styles.body}>
            <p>Loading...</p>
          </div>
        )
      }
      {
        !userState.user && !userState.loading && (
          <Buttons
            updateFormState={updateFormState}
          />
        )
      }
      {
        userState.user && userState.user.signInUserSession && (
          <div style={styles.body}>
            <h4>
              Welcome {userState.user.signInUserSession.idToken.payload.email}
            </h4>
            <button
              style={{ ...styles.button, ...styles.signOut }}
              onClick={getAllJourneys}>
              <FaSignOutAlt color='white' />
              <p style={{...styles.text}}>All journeys</p>
            </button>
            {
              allJourneys && allJourneys.length>0 && allJourneys.map(
                (item)=><p>
                    UserId: {item.user_id} Origin Address: {item.origin_address} Destination Address: {item.destination_address}
                  </p>
              )
            }
            <button
              style={{ ...styles.button, ...styles.signOut }}
              onClick={getUserJourneys}>
              <FaSignOutAlt color='white' />
              <p style={{...styles.text}}>My journeys</p>
            </button>
            {
              userJourneys && userJourneys.length>0 && userJourneys.map(
                (item)=><p> 
                  UserId: {item.user_id} Origin Address: {item.origin_address} Destination Address: {item.destination_address}
                  </p>
              )
            }
            <button
              style={{ ...styles.button, ...styles.signOut }}
              onClick={getWeatherInformation}>
              <FaSignOutAlt color='white' />
              <p style={{...styles.text}}>Weather Integration</p>
            </button>
            {
              weather && weather.number && (
                <div>
                  <p>Temperature: {weather.temperature} {weather.temperatureUnit}</p>
                  <p>Wind Speed: {weather.windSpeed}</p>
                  <p>{weather.detailedForecast}</p>
                </div>
              )
            }

            <button
              style={{ ...styles.button, ...styles.signOut }}
              onClick={signOut}>

              <FaSignOutAlt color='white' />
              <p style={{...styles.text}}>Sign Out</p>
            </button>

          </div>

         

        )
      }
    </div>
  );
}

function reducer (state, action) {
  switch(action.type) {
    case 'setUser':  
      return { ...state, user: action.user, loading: false }
    case 'loaded':
      return { ...state, loading: false }
    default:
      return state
  }
}

async function checkUser(dispatch) {
  try {
    const user = await Auth.currentAuthenticatedUser()
    console.log('user: ', user)
    const info = await Auth.currentUserInfo()
    console.log(info)
    dispatch({ type: 'setUser', user })
  } catch (err) {
    console.log('err: ', err)
    dispatch({ type: 'loaded' })
  }
}

function signOut() {
  Auth.signOut()
    .then(data => {
      console.log('signed out: ', data)
    })
    .catch(err => console.log(err));
}



const styles = {
  appContainer: {
    paddingTop: 85,
  },
  loading: {
    
  },
  button: {
    marginTop: 15,
    width: '100%', 
    maxWidth: 250,
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '0px 16px',
    borderRadius: 2,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, .3)',
    cursor: 'pointer',
    outline: 'none',
    border: 'none',
    minHeight: 40
  },
  text: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
    fontWeight: 'bold'
  },
  signOut: {
    //backgroundColor: 'black'
    backgroundColor: '#FF9900'
  },
  footer: {
    fontWeight: '600',
    padding: '0px 25px',
    textAlign: 'right',
    color: 'rgba(0, 0, 0, 0.6)'
  },
  anchor: {
    color: 'rgb(255, 153, 0)',
    textDecoration: 'none'
  },
  body: {
    padding: '0px 30px',
    height: '78vh'
  }
}

export default App
