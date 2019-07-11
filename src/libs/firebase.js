import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import orderBy from 'lodash/orderBy';
import shuffle from 'lodash/shuffle';
import { config } from './config';

const production = !!localStorage.getItem('私の信仰');

const FIFTEEN_MINUTES = 1000 * 60 * 15;
const HOUR = FIFTEEN_MINUTES * 4;
const DAY = HOUR * 24;
const MONTH = DAY * 30;
const IN_LEARN = 'inLearning';
const TO_REVIEW = 'toReview';

const getDate = () => {
	const date = new Date();
	return (new Date(`${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()}`)).getTime();
};

const getDateWithHours = () => {
	const date = new Date();
	return (new Date(`${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()} ${date.getHours()}:00`)).getTime();
};

const getDateWithHoursAndMinutes = () => {
	const date = new Date();
	return (new Date(`${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`)).getTime();
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
				let isReset = false;
				const state = data.val();
				const currentDateWithMinutes = getDateWithHoursAndMinutes();
				const cardInReview = Object.values(state.reviewList || {});
				const cardInReviewIds = Object.keys(state.reviewList || {});
				const cardInLearned = Object.values(state.knowList || {});
				const cardInLearnedIds = Object.keys(state.knowList || {});
				const learnedLevels = state.config.levels || [];
				const allCards = Object.values(state.items)
					.filter((item) => learnedLevels.includes(item.tags[0]));

				if (!state.activity.date) {
					this.db.ref('activity/date').set(currentDateWithMinutes);
				}
				if (state.activity.date < currentDateWithMinutes) {
					this.db.ref('activity/date').set(currentDateWithMinutes);
					state.activity.date = currentDateWithMinutes;

					const savedDayDate = (new Date(state.activity.date)).getDate();
					const nowDayDate = (new Date(currentDateWithMinutes)).getDate();

					const countForSaving = savedDayDate === nowDayDate ? state.activity.count : 0;
					this.db.ref('activity/count').set(countForSaving);
					state.activity.count = countForSaving;
					isReset = countForSaving === 0;
				}
				const withoutNew = state.activity.count >= state.config.maxNew;

				const savedDay = (new Date(state.activity.date)).getDate();
				const nowDay = (new Date(currentDateWithMinutes)).getDate();

				if (!isReset && savedDay === nowDay) {
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
					.filter((card) => card.date + card.day <= currentDateWithMinutes)
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

	lowCardStatus(card) {
		if (!production) {
			return;
		}

		if (card.status === TO_REVIEW) {
			this.addToReviewList(card);
			return;
		}

		if (card.status === IN_LEARN) {
			this.addToNewList(card);
			return;
		}
	}

	upCardStatus(card) {
		if (!production) {
			return;
		}

		if (card.status === IN_LEARN || card.status === TO_REVIEW) {
			this.addToKnowList(card);
			return;
		}

		if (!card.status) {
			this.db.ref('/activity/count').once('value', (data) => {
				const count = data.val();
				this.db.ref('activity/count').set(count + 1);
			});
		}

		this.addToReviewList(card);
	}

	addToKnowList(card) {
		if (!production) {
			return;
		}

		// If kanji learning less then 4 hours we should send it to ReviewList.
		if (card.status !== TO_REVIEW && card.day <= HOUR * 4) {
			this.addToReviewList(card);
			return;
		}

		const intervalRepeating = card.day + card.day * 2 >= MONTH
			? card.day + MONTH
			: card.day + card.day * 2;
		const date = card.status === IN_LEARN ? getDate() : card.date;

		this.db.ref(`knowList/${card.id}`).set({ ...card, date, day: intervalRepeating, status: TO_REVIEW, });
		this.db.ref(`reviewList/${card.id}`).set(null);
	}

	addToReviewList(card) {
		if (!production) {
			return;
		}

		const intervalRepeating = !card.day
			? FIFTEEN_MINUTES
			: card.day >= HOUR * 4
				? DAY
				: card.day + card.day * 2;
		const date = card.date
			? card.date
			: getDateWithHoursAndMinutes();

		this.db.ref(`knowList/${card.id}`).set(null);
		this.db.ref(`reviewList/${card.id}`).set({ ...card, date, day: intervalRepeating, status: IN_LEARN, });
	}

	addToNewList(card) {
		if (!production) {
			return;
		}

		this.db.ref(`knowList/${card.id}`).set(null);
		this.db.ref(`reviewList/${card.id}`).set(null);
	}
}

export default new Firebase()
