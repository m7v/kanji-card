import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import orderBy from 'lodash/orderBy';
import shuffle from 'lodash/shuffle';
import merge from 'lodash/merge';

const production = false;

const config = {
	apiKey: 'AIzaSyCxWPw-_hj73EsObm7pcbU7Td2CSFtubLw',
	authDomain: 'kanji-anki.firebaseapp.com',
	databaseURL: 'https://kanji-anki.firebaseio.com',
	projectId: 'kanji-anki',
	storageBucket: 'kanji-anki.appspot.com',
	messagingSenderId: '15839805144',
	appId: '1:15839805144:web:106f949c5bcb48bd',
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
				const state = data.val();
				const reviewCard = state.reviewList || {};
				const learnedCard = state.knowList || {};

				const removeIds = merge(/*Object.keys(reviewCard)*/[], Object.keys(learnedCard)).map(i => Number(i));

				const cards = orderBy(
					Object.values(merge(state.items, reviewCard)).filter(((card) => removeIds.indexOf(card.id) === -1)),
					(o) => o.tags[0].match(/\d/g)[0],
					'desc'
				).splice(0, 20);

				return resolve(shuffle(cards));
			})
		});
	}

	getConfig() {
		return this.db.ref('config');
	}

	addToReviewList(card) {
		if (!production) {
			return;
		}

		if (card.status === 'inLearning') {
			this.addToKnowList(card);
			return;
		}
		this.db.ref(`knowList/${card.id}`).set(null);
		this.db.ref(`reviewList/${card.id}`).set({...card, time: '', status: 'inLearning'});
	}

	addToKnowList(card) {
		if (!production) {
			return;
		}

		this.db.ref(`knowList/${card.id}`).set({...card, time: '', status: 'toReview', });
		this.db.ref(`reviewList/${card.id}`).set(null);
	}
}

export default new Firebase()
