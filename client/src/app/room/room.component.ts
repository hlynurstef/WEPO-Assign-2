import { Component, OnInit, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChatService } from '../chat.service';

@Component({
	selector: 'app-room',
	templateUrl: './room.component.html',
	styleUrls: ['./room.component.css'],
})

export class RoomComponent implements OnInit, AfterViewChecked {
	@ViewChild('scrollChat') private myChatScrollContainer: ElementRef;
	@ViewChild('scrollUsers') private myUserScrollContainer: ElementRef;
	@ViewChild('scrollOps') private myOpsScrollContainer: ElementRef;

	users: string[] = [];
	ops: string[] = [];
	roomId: string;
	roomTopic: string;
	newMessage: string;
	messageHistory: {}[];
	roomNotifications: string[] = [];
	currentNotification: string;
	isOp = false;

	constructor(private router: Router,
		private chatService: ChatService,
		private route: ActivatedRoute) { }

	ngOnInit() {
		this.roomId = this.route.snapshot.params['id'];

		this.chatService.connectToRoom(this.roomId, this.chatService.getPassByRoomId(this.roomId)).subscribe(info => {
			if (info['success'] === false) {
				this.router.navigateByUrl('/rooms/');
			}
		});

		this.chatService.getMessage().subscribe(messages => {
			if (messages['roomName'] === this.roomId) {
				this.messageHistory = messages['msg'];
			}
		});
		this.chatService.getUsers().subscribe(obj => {
			if (obj['roomId'] === this.roomId) {
				const usrArr: string[] = [];
				const opArr: string[] = [];
				this.isOp = false;
				for (const op in obj['ops']) {
					if (op !== undefined) {
						opArr.push(op);
						if (op === this.chatService.getCurrentUser()) {
							console.log('I am setting isOp to true');
							this.isOp = true;
						}
					}
				}
				for (const user in obj['users']) {
					if (user !== undefined) {
						if (!opArr.some(x => x === user)) {
							usrArr.push(user);
						}
						this.users = usrArr;
						this.ops = opArr;
					}
				}
			}
		});

		this.chatService.getTopic().subscribe(obj => {
			if (obj['roomName'] === this.roomId) {
				this.roomTopic = obj['topic'];
			}
		});
		this.chatService.getServerMessage().subscribe(obj => {
			if (obj['type'] === 'quit') {
				for (const chan in obj['room']) {
					if (chan === this.roomId) {
						const notification = 'User ' + obj['user'] +  ' quit the server!';
						this.addNotification(notification);
					}
				}
			} else {
				if (obj['room'] === this.roomId) {
					const notification = 'User ' + obj['user'] + ' ' + obj['type'] + 'ed room ' + obj['room'];
					this.addNotification(notification);
				}
			}
		});

		this.scrollToBottom();
	}

	onSendMessage() {
		if (this.newMessage !== '') {
			if (this.newMessage.substring(0, 1) === '!') {
				this.commandParsing(this.newMessage);
			}
			this.chatService.sendMsg(this.roomId, this.newMessage);
			this.newMessage = '';
			this.scrollToBottom();
		}
	}

	ngAfterViewChecked() {
		this.scrollToBottom();
	}

	scrollToBottom(): void {
		try {
			this.myChatScrollContainer.nativeElement.scrollTop = this.myChatScrollContainer.nativeElement.scrollHeight;
			this.myUserScrollContainer.nativeElement.scrollTop = this.myUserScrollContainer.nativeElement.scrollHeight;
			this.myOpsScrollContainer.nativeElement.scrollTop = this.myOpsScrollContainer.nativeElement.scrollHeight;
		} catch (err) { }
	}

	addNotification(notification: string) {
		this.currentNotification = notification;
		this.roomNotifications.push(notification);
	}

	onPartRoom() {
		this.chatService.partRoom(this.roomId);
		this.router.navigateByUrl('/rooms');
	}

	setOp(user: string) {
		this.chatService.setOp(this.roomId, user).subscribe(succeeded => {
			if (succeeded === false) {
				console.log('You dont have any ops bro!!');
			}
		});
	}

	deOp(user: string) {
		this.chatService.deOp(this.roomId, user).subscribe(succeeded => {
			if (succeeded === false) {
				console.log('You dont have any ops bro!!');
			}
		});
	}

	kickUser(user: string) {
		this.chatService.kickUser(this.roomId, user).subscribe(succeeded => {
			if (succeeded === false) {
				console.log('You dont have any ops bro!!');
			}
		});
	}

	banUser(user: string) {
		this.chatService.banUser(this.roomId, user).subscribe(succeeded => {
			if (succeeded === false) {
				console.log('You dont have any ops bro!!');
			}
		});
	}




	// These are all the commands that an OP can send in the chat to control the room
	commandParsing(msg: string) {
		if (this.newMessage.substring(0, 6) === '!topic') {
			this.chatService.setTopic(this.roomId, this.newMessage.substring(6)).subscribe(succeded => {
				if (succeded === false) {
					console.log('You dont have any ops bro!!');
				}
			});
		} else if (this.newMessage.substring(0, 3) === '!op') {
			if (this.users.some(x => x === this.newMessage.substring(4))) {
				this.setOp(this.newMessage.substring(4));
			}
		} else if (this.newMessage.substring(0, 5) === '!deop') {
			if (this.ops.some(x => x === this.newMessage.substring(6))) {
				this.deOp(this.newMessage.substring(6));
			}
		} else if (this.newMessage.substring(0, 5) === '!kick') {
			if (this.ops.some(x => x === this.newMessage.substring(6)) || this.users.some(x => x === this.newMessage.substring(6))) {
				this.kickUser(this.newMessage.substring(6));
			}
		} else if (this.newMessage.substring(0, 4) === '!ban') {
			if (this.ops.some(x => x === this.newMessage.substring(5)) ||
			this.users.some(x => x === this.newMessage.substring(5))) {
				this.banUser(this.newMessage.substring(5));
			}
		} else if (this.newMessage.substring(0, 5) === '!part') {
			this.onPartRoom();
		}
	}
}
