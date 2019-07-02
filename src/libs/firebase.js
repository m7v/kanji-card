import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import orderBy from 'lodash/orderBy';
import shuffle from 'lodash/shuffle';

const production = true;

const DAY = 1000 * 60 * 60 * 24;
const IN_LEARN = 'inLearning';
const TO_REVIEW = 'toReview';

const config = {
	apiKey: 'AIzaSyCxWPw-_hj73EsObm7pcbU7Td2CSFtubLw',
	authDomain: 'kanji-anki.firebaseapp.com',
	databaseURL: 'https://kanji-anki.firebaseio.com',
	projectId: 'kanji-anki',
	storageBucket: 'kanji-anki.appspot.com',
	messagingSenderId: '15839805144',
	appId: '1:15839805144:web:106f949c5bcb48bd',
};

const getDate = () => {
	var date = new Date();
	return (new Date(`${date.getMonth() + 1}.${date.getDay()}.${date.getFullYear()}`)).getTime();
};

class Firebase {
	constructor() {
		app.initializeApp(config);
		// this.auth = app.auth();
		this.db = app.database();
	}
	//
	// login(email, password) {
	// 	return this.auth.signInWithEmailAndPassword(email, password);
	// }
	//
	// logout() {
	// 	return this.auth.signOut()
	// }
	//
	// async register(name, email, password) {
	// 	await this.auth.createUserWithEmailAndPassword(email, password);
	// 	return this.auth.currentUser.updateProfile({
	// 		displayName: name,
	// 	})
	// }
	//
	// addQuote(quote) {
	// 	if(!this.auth.currentUser) {
	// 		return alert('Not authorized');
	// 	}
	//
	// 	return this.db.doc(`users_codedamn_video/${this.auth.currentUser.uid}`).set({
	// 		quote,
	// 	})
	// }
	//
	// isInitialized() {
	// 	return new Promise(resolve => {
	// 		this.auth.onAuthStateChanged(resolve);
	// 	});
	// }
	//
	// getCurrentUsername() {
	// 	return this.auth.currentUser && this.auth.currentUser.displayName;
	// }
	//
	// async getCurrentUserQuote() {
	// 	const quote = await this.db.doc(`users_codedamn_video/${this.auth.currentUser.uid}`).get();
	// 	return quote.get('quote');
	// }

	getKanjiCards() {
		return new Promise((resolve) => {
			this.db.ref('/').once('value', (data) => {
				let isReseted = false;
				const state = data.val();
				const currentDate = getDate();
				const cardInReview = Object.values(state.reviewList || {});
				const cardInReviewIds = Object.keys(state.reviewList || {});
				const cardInLearned = Object.values(state.knowList || {});
				const cardInLearnedIds = Object.keys(state.knowList || {});
				const allCards = Object.values(state.items);

				if (!state.activity.date) {
					this.db.ref('activity/date').set(currentDate);
				}
				if (state.activity.date < currentDate) {
					this.db.ref('activity/date').set(currentDate);
					this.db.ref('activity/count').set(0);
					state.activity.date = currentDate;
					state.activity.count = 0;
					isReseted = true;
				}
				const withoutNew = state.activity.count >= state.config.maxNew;

				if (!isReseted && state.activity.date === currentDate) {
					if (withoutNew && !cardInReviewIds.length) {
						return resolve({
							cards: [],
							message: 'You need to rest'
						});
					}
				}

				const removeIds = [...cardInReviewIds, ...cardInLearnedIds].map(i => Number(i));
				const newCards = withoutNew
					? []
					: orderBy(
						allCards.filter((item) => !removeIds.includes(item.id)),
						(o) => o.tags[0].match(/\d/g)[0],
						'desc'
					).splice(0, state.config.maxNew - state.activity.count);

				const reviewCards = [...cardInReview, ...cardInLearned]
					.filter((card) => card.date + card.day <= currentDate)
					.splice(0, state.config.maxReview);

				const cards = [...newCards, ...reviewCards];

				if (!cards.length) {
					return resolve({
						cards: [],
						message: 'You need to rest'
					});
				}
					
				return resolve({
					cards: shuffle(cards),
					message: undefined,
				});
			})
		});
	}

	addToReviewList(card) {
		if (!production) {
			return;
		}

		if (card.status === IN_LEARN) {
			this.addToKnowList(card);
			return;
		}

		this.db.ref('/activity/count').once('value', (data) => {
			const count = data.val();
			this.db.ref('activity/count').set(count + 1);
		});
		this.db.ref(`knowList/${card.id}`).set(null);
		this.db.ref(`reviewList/${card.id}`).set({ ...card, date: getDate(), day: DAY, status: IN_LEARN, });
	}

	addToKnowList(card) {
		if (!production) {
			return;
		}

		this.db.ref(`knowList/${card.id}`).set({ ...card, day: card.day * 2, status: TO_REVIEW, });
		this.db.ref(`reviewList/${card.id}`).set(null);
	}
}

export default new Firebase()
