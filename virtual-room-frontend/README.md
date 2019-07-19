
# virtual room frontend

Virtual Room is a project for realtime communication in audio, video and chat. 

## Frontend technology stack :
* React v16
* Redux
* WebRTC

## Application Structure

```
.
├── public                  # Static public assets and build
├── src                     #  
│   ├── actions             # 
│   ├── components
|   |   ├── auth
|   |   ├── dashboard
|   |   ├── layout
|   |   └── private-route
|   |
|   |
│   ├── reducers            # 
|   ├── utils               #
|   ├── store.js            #
|   └── index.js            #
|
├── server.js               # testing socket routes and this will be moved to virtual room backend.
```

## WebRTC 

WebRTC is a web standard for Peer to Peer (P2P) voice and video chats (and data) that works natively in the browser (read: no plugins!). Unlike the complex, proprietary voice/video platforms of ages past, the WebRTC standard is intended to be implemented solely with HTML5 and a relatively simple Javascript API.

### Untangaling the WebRTC Flow

![WebRTC Flow](https://www.pkc.io/assets/images/blog/WebRTC.svg)

Ref - https://www.pkc.io/blog/untangling-the-webrtc-flow/

#### WebRTC Guides 
* https://codelabs.developers.google.com/codelabs/webrtc-web/#0
* https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API  -  Mozilla Documentation
* https://www.html5rocks.com/en/tutorials/webrtc/basics/#toc-rtcpeerconnection
* https://www.pkc.io/blog/untangling-the-webrtc-flow/

- - - -
- - - -
- - - -

# React App Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

