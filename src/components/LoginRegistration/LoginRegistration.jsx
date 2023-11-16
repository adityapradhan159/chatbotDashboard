import React, { useState } from 'react'
import "./loginREgistration.css"
import axios from 'axios'

const LoginRegistration = () => {

  const [showLoginForm,setShowloginForm] = useState(true)
  const [name,setName] = useState("")
  const [phoneNumber,setPhoneNumber] = useState("")
  const [phoneId,setPhoneId] = useState("")
  const [WhatsappId,setWhatsappId] = useState("")
  const [accessToken,setAccessToken] = useState("")
  const [password,setPassword] = useState("")

  const handleLoginRegister = (form) => {
    if(form == "login"){
      axios.post("https://knowing-cottony-metal.glitch.me/api/login",{
        "PhoneNumber":phoneNumber,
        "password":password
      })
      .then((res) => {
        console.log(res)
        localStorage.setItem("whatsAppBusinessAccountId",res.data.whatsAppBusinessAccountId)
      })
      .catch((err) => {
        console.log(err)
      })
    }
    else{
      axios.post("https://knowing-cottony-metal.glitch.me/api/register",{
        "name":name,
        "accesToken":accessToken,
        "PhoneNumberId":phoneId,
        "whatsAppBusinessAccountId":WhatsappId,
        "PhoneNumber":phoneNumber,
        "password":password

      })
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
    }
    
  }

  return (
    <div className='LoginRegistration'>

        <div className="LoginRegistration-container">

          {
            showLoginForm == true ? 

            <div className="login-Container">
              <h2>Login</h2>

              <div className="input-container">
                <label htmlFor="">Phone Number</label>
                <input type="text" value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)}/>
              </div>

              <div className="input-container">
                <label htmlFor="">Password</label>
                <input type="text" value={password} onChange={(e)=>setPassword(e.target.value)}/>
              </div>

              <button onClick={()=>handleLoginRegister("login")}>Submit</button>

            </div>

            :
            <div className="login-Container">
              <h2>Register</h2>

              <div className="input-container">
                <label htmlFor="">Name</label>
                <input type="text" value={name} onChange={(e)=>setName(e.target.value)}/>
              </div>

              <div className="input-container">
                <label htmlFor="">Phone Number</label>
                <input type="text" value={phoneNumber} onChange={(e)=>setPhoneNumber(e.target.value)}/>
              </div>

              <div className="input-container">
                <label htmlFor="">Phone Number Id</label>
                <input type="text" value={phoneId} onChange={(e)=>setPhoneId(e.target.value)}/>
              </div>

              <div className="input-container">
                <label htmlFor="">Whatsapp Business Account Id</label>
                <input type="text" value={WhatsappId} onChange={(e)=>setWhatsappId(e.target.value)}/>
              </div>

              <div className="input-container">
                <label htmlFor="">Password</label>
                <input type="text" value={password} onChange={(e)=>setPassword(e.target.value)}/>
              </div>

              <button onClick={()=>handleLoginRegister("register")}>Submit</button>

            </div>
            
          }
            
            



          {
            showLoginForm == true ? 
            <span onClick={()=>{
              setShowloginForm(false)
            }}>Do not have an account? Sign up</span>
            :
            <span onClick={()=>setShowloginForm(true)}>Already have an account? Login</span>
          }

            


        </div>


    </div>
  )
}

export default LoginRegistration