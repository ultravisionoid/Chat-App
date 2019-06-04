const socket=io();
// COUNTING
// socket.on("count Updated",(count)=>{
// 	console.log("the count has been updated",count);
// })

// document.querySelector('#increment').addEventListener('click',()=>{
// 	console.log("clicked")
// 	socket.emit('increment')
// })

//Elements
const $messageForm=document.querySelector("#message-form")
const $messageFormInput=$messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")

const $locationForm = document.querySelector("#send-location");

const  $messages = document.querySelector("#messages")

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;

// options
const {username,room}=Qs.parse(location.search,{ ignoreQueryPrefix:true})

const autoscroll = ()=>{
	// New message element
	const $newMessage = $messages.lastElementChild

	//height of the new message
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight+newMessageMargin
	console.log(newMessageMargin)
	//Vissible height
	const visibleHeight = $messages.offsetHeight
	//Heighty of msgs container

	const containerHeight = $messages.scrollHeight;
	//How far have we scrolled
	const scrollOffset = $messages.scrollTop+visibleHeight;
	if(containerHeight - newMessageHeight<=scrollOffset){
		$messages.scrollTop=$messages.scrollHeight;
	}

}


socket.on("message",(msg)=>{
	console.log(msg)
	const html = Mustache.render(messageTemplate,{
		username:msg.username,
		message:msg.text,
		createdAt:moment(msg.createdAt).format("h:mm A")
	})
	$messages.insertAdjacentHTML("beforeend",html)
	autoscroll();
})

socket.on("locationMessage",(url)=>{
	console.log(url);
	const html=Mustache.render(locationMessageTemplate,{
		username:url.username,
		url:url.url,
		createdAt:moment(url.createdAt).format("h:mm A"),

	
	})
	$messages.insertAdjacentHTML("beforeend",html)
	autoscroll();

})

socket.on("roomData",({room,users})=>{

	const html = Mustache.render(sideBarTemplate,{
		room,
		users
	})
	document.querySelector("#sidebar").innerHTML=html

})

//MESSAGE STUFF!!!

$messageForm.addEventListener("submit",(e)=>{
	e.preventDefault();

	$messageFormButton.setAttribute("disabled","disabled");

	const message=e.target.elements.message.value
	socket.emit("sendMessage",message,(error)=>{
		$messageFormButton.removeAttribute("disabled")
		$messageFormInput.value='';
		$messageFormInput.focus()
		if(error){
			return console.log(error);
		}
		console.log("the message was delivered!")
	})
})

//LOCATION stuff!!!
// const $locationFormButton = $locationForm.querySelector("button")
$locationForm.addEventListener("click",()=>{
	$locationForm.setAttribute("disabled","disabled");
	if(!navigator.geolocation){
		return alert("geolocation not supported by your browser")
	}
	navigator.geolocation.getCurrentPosition((position)=>{
		// console.log(position)
		socket.emit("sendLocation",{
			latitude:position.coords.latitude,
			longitude:position.coords.longitude
		},(error)=>{
			console.log("LOCATION delivered")
			$locationForm.removeAttribute("disabled")
		})	
	})
})
socket.emit("join",{username,room},(error)=>{
	if(error){
		alert(error);
		location.href="/"
	}

})