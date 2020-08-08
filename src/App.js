import React, { Component } from 'react';
import './App.css';
import Navigation from './Components/Navigation/Navigation';
import 'tachyons';
import Logo from './Components/Logo/Logo';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm';
import Rank from './Components/Rank/Rank';
import Particles from 'react-particles-js';
import Clarifai from'clarifai';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import SignIn from './Components/SignIn/SignIn';
import Register from './Components/Register/Register';



const app = new Clarifai.App({
  apiKey: 'b1149e5916144a2b9f608e003e72a0f3'
 });

const particlesOptions = {
  particles: {
    number: {
      value: 50,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

class App extends Component {

  constructor(){
    super();
    this.state = {
      input :'',
      imageUrl :'',
      box: {},
      route : 'signIn',
      isSignedIn: false,
      user : {
        id:'',
        name : '',
        email : '',
        entries : 0,
        joined : ''
      }
    }
  }

  LoadUser= (data) => {
    this.setState({user : {
        id:data.id,
        name : data.name,
        email : data.email,
        entries : data.entries,
        joined : data.joined
    }})
  }

  calculateFaceLocation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width,height);
    return {
      leftCol : clarifaiFace.left_col * width ,
      topRow : clarifaiFace.top_row * height ,
      rightCol : width-(clarifaiFace.right_col * width),
      bottomRow : height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState( {box : box} );
  }

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState({isSignedIn : false })
    }
    else if(route === 'home'){
      this.setState({isSignedIn : true})
    }
    this.setState({route : route});
  }
   
  onInputChange = (event) => {
    this.setState({input : event.target.value});
    console.log(event.target.value);
  }

  onButtonSubmit = () => {
      console.log('click');
      this.setState({imageUrl : this.state.input});
      app.models.predict(Clarifai.FACE_DETECT_MODEL, this.state.input).then(
        response => {
          // do something with response
          // console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
          if(response){
            fetch('http://localhost:3000/image', {
              method : 'put',
              headers : {'Content-Type' : 'application/json'},
              body : JSON.stringify({
                  id : this.state.user.id,
              }) 
            })
            .then(response => response.json())
            .then(count =>{
              // this.setState({user: {
                this.setState(Object.assign(this.state.user,{entries : count}))
              })
            // })
          }
          this.displayFaceBox(
          this.calculateFaceLocation(response))})  
        .catch(err => console.log(err))
  }

  render(){
   const  {isSignedIn ,imageUrl ,route ,box } = this.state;
    return(
      <div className="App">
        <Particles className='particles' params={particlesOptions} />
        <Navigation isSignedIn = {isSignedIn} onRouteChange = {this.onRouteChange}/>
        { route === 'home' ?
          <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
            <FaceRecognition box ={box} imageUrl={imageUrl}/> 
          </div> 
        :
        (
          route === 'signIn' ?
          <SignIn loadUser={this.LoadUser} onRouteChange = {this.onRouteChange} />
          : 
          <Register loadUser={this.LoadUser} onRouteChange = {this.onRouteChange} />
        )
        }
      </div>
    );
  }
}
export default App;
