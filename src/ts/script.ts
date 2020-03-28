import Vue from 'vue'
import VueMaterial from 'vue-material'
import firebase from 'firebase';
import firebaseConfig from './firebase.js';
import { FieldValue, QuerySnapshot } from '@google-cloud/firestore';
import * as _ from 'lodash';
import { DateTime } from 'luxon';

import DialogPrompt from './components/DialogPrompt.vue';
import "../scss/style.scss";

interface message {
	text: string,
	user: number,
	sendTime: firebase.firestore.Timestamp
	sendTimeFormatted: string
}

interface data {
	sending: boolean,
	users: Record<string,user>,
	messages: message[],
	user?: user,
	toSend: {
		text?: string,
		sendTime?: FieldValue,
		user?: string
	}
}

interface user {
	id: string,
	name: string
}

let data: data = {
	sending: false,
	users: {},
	messages: [],
	user: {
		id: localStorage.getItem("id") || "",
		name: localStorage.getItem("name") || ""
	},
	toSend: {}
}

let db;
let app;
setup();
run();
function setup() {
	Vue.use(VueMaterial)

	firebase.initializeApp(firebaseConfig);
	app = firebase.app();
	db = firebase.firestore();
	db.enablePersistence();
	let features = ['messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
	firebase.messaging().requestPermission().then(() => {
		firebase.messaging().usePublicVapidKey("BEb4ALuxGV9FKhfPDcLxLGDJJU08OogYL9DmPmKypvtjwawf4yTjzIy6Rc2id4oLHfo5lmFLQlbbu4A766leZ28");
		firebase.messaging().getToken().then(() => {
			firebase.messaging().onMessage((payload) => {
				alert(payload.title);
			});
			firebase.messaging().setBackgroundMessageHandler((payload) => {
				alert();
			});	
		});	
	 });
}

function run() {
	new Vue({
		el: '#app',
		data,
		components: { DialogPrompt },
		computed: {
			loggedIn(): boolean {
				return this.user && this.user.id ? true : false;
			},
			cleanedMessages(): message[] {
				return _.orderBy(this.messages, 'sendTime.seconds');
			}
		},
		created: function () {
			if (this.loggedIn) {
				this.watchUsers();				
				this.watchMessages();
			}
		},
		methods: {
			watchUsers: function() {
				db.collection('users')
				.onSnapshot((snapshot: QuerySnapshot) => {
					snapshot.forEach(doc => {
						let user = {
							name: doc.data().name,
							id: doc.id
						}
						this.users[doc.id] = user;
					})
				})
			},
			watchMessages: function () {
				db.collection('messages')
					.orderBy("sendTime", "desc")
					.limit(20)
					.onSnapshot((snapshot: QuerySnapshot) => {
						snapshot.docChanges().forEach(change => {
							if (change.type === "added") {
								this.messages.push(<message><unknown>change.doc.data());
								let message = _.last(this.messages);
								if(message){
									message.sendTimeFormatted = DateTime.fromSeconds(change.doc.data().sendTime.seconds).toLocaleString(DateTime.DATETIME_MED);
									let el = document.querySelectorAll(".md-content")[0];
									setTimeout(() => { // move to the back of the line to make sure we add the new element first.
										el.scrollTo({
											top: el.scrollHeight,
											behavior: 'smooth'
										})
									},1);

									vibrate(200);
								}
							}
						})
					})
			},
			sendMessage: function (event?) {
				if (this.user && this.loggedIn && this.toSend.text && this.toSend.text.length) {
					this.sending = true;
					this.toSend.sendTime = firebase.firestore.FieldValue.serverTimestamp();
					this.toSend.user = this.user.id;
					db.collection('messages').add(this.toSend).then(() => {
						this.toSend.text = "";
						this.sending = false;
					});
				}
			},
			login: function (name) {
				db.collection('users').where('name', '==', name).get()
					.then((snapshot: QuerySnapshot) => {
						if (snapshot.size === 1) {
							localStorage.setItem("id", snapshot.docs[0].id)
							localStorage.setItem("name", snapshot.docs[0].data().name)
							this.user = {
								name: snapshot.docs[0].data().name,
								id: snapshot.docs[0].id
							}
							this.watchUsers();
							this.watchMessages();
						} else {
							alert("you don't exist, homie");
						}
					})
			}
		}

	})
}

function vibrate(ms){
	let canVibrate = "vibrate" in navigator || "mozVibrate" in navigator;
	if ( canVibrate ) {
		navigator.vibrate(ms);
	}
}
window.addEventListener('resize', () => {
  let vh = window.innerHeight * 0.01;
  let el = <HTMLElement>document.querySelectorAll(".md-scrollbar")[0];
  el.style.setProperty('--vh', `${vh}px`);
});