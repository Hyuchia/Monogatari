
/* global require */

import { $_, Space, Platform, Preload, Util, FileSystem } from '@aegis-framework/artemis';
import { FancyError } from './FancyError';

const HTML = `
	<!-- Notice messages -->
	<div data-notice="orientation" class="modal">
		<div class="modal__content">
			<p data-string="OrientationWarning">Please rotate your device to play.</p>
		</div>
	</div>

	<!--Game Screen -->
	<section id="game" class="unselectable">
		<div id="particles-js" data-ui="particles"></div>
		<div id="background" data-ui="background"></div>
		<div id='components'>
			<audio type="audio/mpeg" data-component="music"></audio>
			<audio type="audio/mpeg" data-component="voice"></audio>
			<audio type="audio/mpeg" data-component="sound"></audio>
			<div class="video-wrapper text--center vertical middle" data-component="video" data-ui="video-player">
				<video type="video/mp4" data-ui="player" controls="true"></video>
				<button data-action="close-video" data-string="Close">Close</button>
			</div>
		</div>

		<div data-ui="choices" class="vertical text--center middle"></div>
		<div data-ui="text">
			<img data-ui="face" alt="">
			<span data-ui="who"></span>
			<p data-ui="say"></p>
		</div>
		<div data-ui="quick-menu" class="text--right">
			<span data-action="back"><span class="fas fa-arrow-left"></span> <span data-string="Back">Back</span></span>
			<span data-action="distraction-free"><span class="fas fa-eye" data-action="distraction-free"></span> <span data-string="Hide" data-action="distraction-free">Hide</span></span>
			<span data-action="auto-play"><span class="fas fa-play-circle" data-action="auto-play"></span> <span data-string="AutoPlay" data-action="auto-play">Auto</span></span>
			<span data-action="open-menu" data-open="save"><span class="fas fa-save" data-action="open-menu" data-open="save"></span> <span data-string="Save" data-action="open-menu" data-open="save">Save</span></span>
			<span data-action="open-menu" data-open="load"><span class="fas fa-undo" data-action="open-menu" data-open="load"></span> <span data-string="Load" data-action="open-menu" data-open="load">Load</span></span>
			<span data-action="open-menu" data-open="settings"><span class="fas fa-cog" data-action="open-menu" data-open="settings"></span> <span data-string="Settings" data-action="open-menu" data-open="settings">Settings</span></span>
			<span data-action="end"><span class="fas fa-times-circle" data-action="end"></span> <span data-string="Quit" data-action="end">Quit</span></span>
		</div>
	</section>

	<!-- Loading Screen -->
	<section data-menu="loading">
		<div class="middle">
			<h2 data-string="Loading">Loading</h2>
			<progress data-ui="load-progress" value="0" max="100"></progress>
			<small data-string="LoadingMessage">Wait while the assets are loaded.</small>
		</div>
	</section>

	<!-- Main Screen -->
	<section data-menu="main">
		<audio type="audio/mpeg" data-component="ambient"></audio>

		<div class="vertical vertical--right text--right bottom animated bounceIn" data-ui="inner-menu">
			<button data-action="start" data-string="Start">Start</button>
			<button data-action="open-menu" data-open="load" data-string="Load">Load</button>
			<button data-action="open-menu" data-open="settings" data-string="Settings">Settings</button>
			<button data-action="open-menu" data-open="help" data-string="Help">Help</button>
		</div>
	</section>
`;

class Monogatari {

	static onStart () {
		const promises = [];
		for (const action of Monogatari.actions ()) {
			promises.push (action.onStart ());
		}
		return Promise.all (promises);
	}

	static onLoad () {
		const promises = [];
		for (const action of Monogatari.actions ()) {
			promises.push (action.onLoad ());
		}
		return Promise.all (promises);
	}

	static width () {
		return getComputedStyle($_(Monogatari.selector).get (0)).width.replace ('px', '');
	}

	static height () {
		return getComputedStyle($_(Monogatari.selector).get (0)).height.replace ('px', '');
	}

	static string (key) {
		if (typeof Monogatari._translations[Monogatari.preference ('Language')] !== 'undefined') {
			if (typeof Monogatari._translations[Monogatari.preference ('Language')][key] !== 'undefined') {
				return Monogatari._translations[Monogatari.preference ('Language')][key];
			} else {
				FancyError.show (
					`Translation for string "${key}" could not be found`,
					'Monogatari attempted to find a translation for the current language set in the preferences but there was none.',
					{
						'String Not Found': key,
						'Language': Monogatari.preference ('Language'),
						'Found in these elements': $_(`[data-string="${key}"]`).collection,
						'You may have meant one of these': Object.keys (Monogatari._translations[Monogatari.preference ('Language')]),
						'Help': {
							'_': 'Please check that this string has been correctly defined in your translations. A translation is defined as follows:',
							'_1': `
								<pre>
									<code class='language-javascript'>
									Monogatari.translation ("YourLanguage", {
										"SomeString": "Your Translation"
									});
									</code>
								</pre>
							`,
							'_2': 'You may also want to check if the [data-string] property of the HTML elements above is correct or if they have a typo.',
							'Documentation': '<a href="https://monogatari.io/documentation/configuration/internationalization/" target="_blank">Internationalization</a>'
						}
					}
				);
			}
		} else {
			FancyError.show (
				'Language could not be found',
				`Monogatari attempted to translate the UI using the current language set in the preferences but no translations could be found
				for it.`,
				{
					'Problematic Language': Monogatari.preference ('Language'),
					'You may have meant one of these': Object.keys (Monogatari._translations),
					'Help': {
						'_': 'Please check if you have defined correctly the translations for this language, translations are defined as follows:',
						'_1': `
							<pre>
								<code class='language-javascript'>
								Monogatari.translation ("YourLanguage", {
									"SomeString": "Your Translation"
								});
								</code>
							</pre>
						`,
						'_2': 'You may also want to check if the value of your language selector is right:',
						'_3': `
							<pre>
								<code class='language-markup'>
								${$_('[data-action="set-language"]').value ()}
								</code>
							</pre>
						`,
						'Documentation': '<a href="https://monogatari.io/documentation/configuration/internationalization/" target="_blank">Internationalization</a>'
					}
				}
			);
		}
	}

	static history (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				if (typeof Monogatari._history[object] === 'undefined') {
					Monogatari._history[object] = [];
				}
				return Monogatari._history[object];
			} else {
				Monogatari._history = Object.assign ({}, Monogatari._history, object);
			}
		} else {
			return Monogatari._history;
		}
	}

	static state (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Monogatari._state[object];
			} else {
				Monogatari._state = Object.assign ({}, Monogatari._state, object);
			}
		} else {
			return Monogatari._state;
		}
	}

	static registerAction (action) {
		Monogatari._actions.push (action);
	}

	static unregisterAction (action) {
		Monogatari._actions = Monogatari._actions.filter ((a) => !(a instanceof action));
	}

	static actions () {
		return Monogatari._actions;
	}

	static action (id, settings = null) {
		if (settings !== null) {
			Monogatari._actions.find ((a) => a.id === id).settings = Object.assign ({}, Monogatari._actions.find ((a) => a.id === id).settings, settings);
		} else {
			return Monogatari._actions.find ((a) => a.id === id);
		}
	}

	static registerComponent (component) {
		Monogatari._components.push (component);
	}

	static unregisterComponent (component) {
		Monogatari._components = Monogatari._actions.filter ((c) => !(c instanceof component));
	}

	static components () {
		return Monogatari._components;
	}

	static component (id, configuration = null) {
		if (configuration !== null) {
			Monogatari._components.find ((a) => a.id === id).configuration (configuration);
		} else {
			return Monogatari._components.find ((a) => a.id === id);
		}
	}

	static assets (type = null, object = null) {
		if (type !== null && object !== null) {
			if (typeof Monogatari._assets[type] !== 'undefined') {
				Monogatari._assets[type] = Object.assign ({}, Monogatari._assets[type], object);
			} else {
				Monogatari._assets[type] = object;
			}
		} else if (type !== null) {
			if (typeof type === 'string') {
				return Monogatari._assets[type];
			} else if (typeof type === 'object') {
				Monogatari._assets = Object.assign ({}, Monogatari._assets, object);
			}
		} else {
			return Monogatari._assets;
		}
	}

	static asset (type, name, value = null) {
		if (typeof Monogatari._assets[type] !== 'undefined') {
			if (value !== null) {
				Monogatari._assets[type][name] = value;
			} else {
				return Monogatari._assets[type][name];
			}
		} else {
			console.error (`Tried to interact with a non-existing asset type ${type}.`);
		}
	}

	static characters (object = null) {
		if (object !== null) {
			Monogatari._characters = Object.assign ({}, Monogatari._characters, object);
		} else {
			return Monogatari._characters;
		}
	}

	static character (id, object = null) {
		if (object !== null) {
			if (typeof Monogatari._characters[id] !== 'undefined') {
				Monogatari._characters[id] = Object.assign ({}, Monogatari._characters[id], object);
			} else {
				Monogatari._characters[id] = object;
			}
		} else {
			return Monogatari._characters[id];
		}
	}

	static translation (language, strings) {
		if (typeof Monogatari._translations[language] !== 'undefined') {
			Monogatari._translations[language] = Object.assign ({}, Monogatari._translations[language], strings);
		} else {
			Monogatari._translations[language] = strings;
		}
	}

	static setting (key, value = null) {
		if (value !== null) {
			Monogatari._settings[key] = value;
		} else {
			if (typeof Monogatari._settings[key] !== 'undefined') {
				return Monogatari._settings[key];
			} else {
				console.error (`Tried to access non existent setting with name '${key}'.`);
			}
		}
	}

	static settings (object = null) {
		if (object !== null) {
			Monogatari._settings = Object.assign ({}, Monogatari._settings, object);
		} else {
			return Monogatari._settings;
		}
	}

	static preference (key, value = null) {
		if (value !== null) {
			Monogatari._preferences[key] = value;
			Monogatari.Storage.update ('Settings', Monogatari._preferences);
		} else {
			if (typeof Monogatari._preferences[key] !== 'undefined') {
				return Monogatari._preferences[key];
			} else {
				console.error (`Tried to access non existent preference with name '${key}'.`);
			}
		}
	}

	static preferences (object = null) {
		if (object !== null) {
			Monogatari._preferences = Object.assign ({}, Monogatari._preferences, object);
			Monogatari.Storage.update ('Settings', Monogatari._preferences);
		} else {
			return Monogatari._preferences;
		}
	}

	static status (object = null) {
		if (object !== null) {
			Monogatari._status = Object.assign ({}, Monogatari._status, object);
		} else {
			return Monogatari._status;
		}
	}

	static storage (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Monogatari._storage[object];
			} else {
				Monogatari._storage = Object.assign ({}, Monogatari._storage, object);
			}
		} else {
			return Monogatari._storage;
		}
	}

	static script (object = null) {
		if (typeof object === 'object' && object !== null) {
			Monogatari._script = Object.assign ({}, Monogatari._script, object);
		} else if (typeof object === 'string') {
			if (Monogatari.setting ('MultiLanguage') === true) {
				return Monogatari._script[Monogatari.preference ('Language')][object];
			} else {
				return Monogatari._script[object];
			}
		} else {
			if (Monogatari.setting ('MultiLanguage') === true) {
				return Monogatari._script[Monogatari.preference ('Language')];
			} else {
				return Monogatari._script;
			}
		}
	}

	static label (key = null, language = null, value = null) {
		if (typeof language === 'string' && value !== null) {
			if (typeof Monogatari._script[language] !== 'object') {
				Monogatari._script[language] = {};
			}
			Monogatari._script[language][key] = value;
		} else if (typeof language === 'object' && language !== null && value === null) {
			if (typeof Monogatari._script[key] !== 'object') {
				Monogatari._script[key] = [];
			}
			Monogatari._script[key] = language;
		} else if (typeof language === 'string' && value === null) {
			return Monogatari._script[language][key];
		} else if (key !== null) {
			return Monogatari._script[key];
		} else {
			return Monogatari.script (Monogatari.state ('label'));
		}
	}

	static fn (name, { apply = () => true, revert = () => true }) {
		if (typeof apply !== 'function' && typeof revert !== 'function') {
			return Monogatari._functions [name];
		} else {
			Monogatari._functions [name] = {
				apply,
				revert
			};
		}
	}

	static globals (object = null) {
		if (object !== null) {
			Monogatari._globals = Object.assign ({}, Monogatari._globals, object);
		} else {
			return Monogatari._globals;
		}
	}

	static global (key, value) {
		if (typeof value !== 'undefined') {
			Monogatari._globals[key] = value;
		} else {
			return Monogatari._globals[key];
		}
	}

	/**
	 * Localize every element with a data-string property using the translations
	 * available. If no translation is found for the current language, the current
	 * text of the element will be kept.
	 */
	static localize () {

		$_(`${Monogatari.selector} [data-string]`).each ((element) => {
			const string_translation = Monogatari.string ($_(element).data ('string'));

			// Check if the translation actually exists and is not empty before
			// replacing the text.
			if (typeof string_translation !== 'undefined' && string_translation !== '') {
				$_(element).text (string_translation);
			}
		});
	}

	/**
	 * Preload game assets
	 */
	static preload () {
		const promises = [];
		let assetCount = 0;

		// Check if asset preloading is enabled. Preloading will not be done in
		// electron or cordova since the assets are expected to be available
		// locally.
		if (Monogatari.setting ('Preload') && !Platform.electron () && !Platform.cordova () && location.protocol.indexOf ('file') < 0) {

			// Show loading screen
			$_('[data-menu="loading"]').show ();

			for (const category of Object.keys (Monogatari.assets ())) {
				for (const asset of Object.values (Monogatari.assets (category))) {
					if (FileSystem.isImage (asset)) {
						promises.push (Preload.image (`assets/${category}/${asset}`).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					} else {
						promises.push (Preload.file (`assets/${category}/${asset}`).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					}
					assetCount += 1;
				}
			}

			for (const character in Monogatari.characters ()) {
				let directory = '';

				// Check if the character has a directory defined where its images
				// are located
				if (typeof character.Directory !== 'undefined') {
					directory = character.Directory + '/';
				}

				if (typeof character.Images !== 'undefined') {
					for (const image of Object.values (character.Images)) {
						promises.push (Preload.image ('assets/characters/' + directory + image).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					}
					assetCount += 1;
				}

				if (typeof character.Side !== 'undefined') {
					for (const image of Object.values (character.Side)) {
						promises.push (Preload.image ('assets/characters/' + directory + image).finally (() => {
							$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
						}));
					}
					assetCount += 1;
				}

				if (typeof character.Face !== 'undefined') {
					promises.push (Preload.image ('assets/characters/' + directory + character.Face).finally (() => {
						$_('[data-ui="load-progress"]').value (parseInt($_('[data-ui="load-progress"]').value ()) + 1);
					}));
					assetCount += 1;
				}
			}

			$_('[data-ui="load-progress"]').attribute ('max', assetCount);
			return Promise.all (promises);
		} else {
			return Promise.resolve ();
		}
	}


	static replaceVariables (statement) {
		const matches = statement.match (/{{\S+}}/g);
		if (matches !== null) {
			for (const match of matches) {
				const path = match.replace ('{{', '').replace ('}}', '').split ('.');

				let data = Monogatari.storage ()[path[0]];

				for (let j = 1; j < path.length; j++) {
					data = data[path[j]];
				}
				statement = statement.replace (match, data);
			}
		}
		return statement;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	static addSlot (i, data) {
		const name = data.name ? data.name : data.date;

		$_('[data-menu="load"] [data-ui="slots"] [data-string="NoSavedGames"]').remove ();
		$_('[data-menu="save"] [data-ui="slots"] [data-string="NoSavedGames"]').remove ();

		if (typeof Monogatari.asset ('scenes', data.image) !== 'undefined') {

			$_('[data-menu="load"] [data-ui="saveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2 animated flipInX'>
					<button class='fas fa-times' data-delete='${i}'></button>
					<img src='assets/scenes/${Monogatari.asset ('scenes', data.image)}' alt=''>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);

			$_('[data-menu="save"] [data-ui="slots"]').append (`
				<figure data-save='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2'>
					<button class='fas fa-times' data-delete='${i}'></button>
					<img src='assets/scenes/${Monogatari.asset ('scenes', data.image)}' alt=''>
					<figcaption>${Monogatari.string ('Overwrite')} #${i}<small>${name}</small></figcaption>
				</figure>
			`);

		} else {
			$_('[data-menu="load"] [data-ui="saveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2 animated flipInX'>
					<button class='fas fa-times' data-delete=${i}></button>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);

			$_('[data-menu="save"] [data-ui="slots"]').append (`
				<figure data-save='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2'>
					<button class='fas fa-times' data-delete=${i}></button>
					<figcaption>${Monogatari.string ('Overwrite')} #${i}<small>${name}</small></figcaption>
				</figure>
			`);
		}
	}

	static addAutoSlot (i, data) {
		const name = data.name ? data.name : data.date;

		$_('[data-menu="load"] [data-ui="slots"] [data-string="NoAutoSavedGames"]').remove ();

		if (typeof Monogatari.asset ('scenes', data.image ) !== 'undefined') {
			$_('[data-menu="load"] [data-ui="autoSaveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2 animated flipInX'>
					<button class='fas fa-times' data-delete=${i}></button>
					<img src='assets/scenes/${Monogatari.asset ('scenes', data.image)}' alt=''>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);
		} else {
			$_('[data-menu="load"] [data-ui="autoSaveSlots"] [data-ui="slots"]').append (`
				<figure data-load-slot='${i}' class='row__column row_column--6 row__column--tablet--4 row__column--desktop--3 row__column--desktop-large--2 animated flipInX'>
					<button class='fas fa-times' data-delete=${i}></button>
					<figcaption>${Monogatari.string ('Load')} #${i} <small>${name}</small></figcaption>
				</figure>
			`);
		}
	}


	// Get's the highest number currently available as a slot id (Save_{?})
	static getMaxSlotId (prefix = 'SaveLabel') {
		return Monogatari.Storage.keys ().then ((keys) => {
			let max = 1;
			for (const saveKey of keys) {
				if (saveKey.indexOf (Monogatari.setting (prefix)) === 0) {
					const number = parseInt(saveKey.split (Monogatari.setting (prefix) + '_')[1]);
					if (number > max) {
						max = number;
					}
				}
			}
			return max;
		});
	}

	static saveTo (prefix = 'SaveLabel', id = null, name = null) {
		// Check if the player is actually playing
		if (Monogatari.global ('playing')) {
			const date = Monogatari.niceDateTime ();

			if (name === null || name.trim () === '') {
				name = date;
			}
			return Monogatari.getMaxSlotId (prefix).then ((max) => {

				if (id === null) {
					id = max + 1;
				}

				return Monogatari.Storage.set (`${Monogatari.setting (prefix)}_${id}`, {
					name,
					date,
					image: Monogatari.state ('scene').split (' ')[1],
					game: Monogatari.object ()
				});
			});
		}
	}

	static loadFromSlot (slot) {
		document.body.style.cursor = 'wait';
		Monogatari.global ('playing', true);

		Monogatari.resetGame ().then (() => {
			$_('section').hide();
			$_('#game').show();
			Monogatari.Storage.get (slot).then ((data) => {
				// TODO: Add compatibility for old save slots
				const { state, history, storage } = data.game;
				Monogatari.state (state);
				Monogatari.history (history);
				Monogatari.storage (storage);

				const promises = [];
				for (const action of Monogatari.actions ()) {
					promises.push (action.onLoad ());
				}

				Promise.all (promises).then (() => {
					$_('#game').show ();
					Monogatari.run(Monogatari.label ()[Monogatari.state ('step')]);
					document.body.style.cursor = 'auto';
				});
			});
		});
	}

	static niceDateTime () {
		return new Date ().toLocaleString ();
	}

	// Assert the result of a function
	static assertAsync (callable, self = null, args = null) {
		Monogatari.global ('block', true);
		return new Promise (function (resolve, reject) {
			const result = callable.apply(self, args);
			// Check if the function returned a simple boolean
			// if the return value is true, the game will continue
			if (typeof result === 'boolean') {
				if (result) {
					resolve ();
				} else {
					reject ();
				}
			} else if (typeof result === 'object') {
				// Check if the result was a promise
				if (typeof result.then != 'undefined') {

					result.then(function (value) {
						if (typeof value === 'boolean') {
							if (value) {
								resolve ();
							} else {
								reject ();
							}
						}
					});
				} else {
					resolve ();
				}
			} else {
				reject ();
			}
		});
	}

	static canProceed () {
		const promises = [];
		for (const action of Monogatari.actions ()) {
			promises.push (action.canProceed ());
		}

		if ($_('#game').isVisible ()
			&& !$_('[data-component="modal"]').isVisible ()
			&& !Monogatari.global ('distraction-free')
			&& !Monogatari.global ('block')) {
			promises.push (Promise.resolve ());
		} else {
			promises.push (Promise.reject ());
		}
		return Promise.all (promises);
	}

	static canRevert () {
		const promises = [];
		for (const action of Monogatari.actions ()) {
			promises.push (action.canRevert ());
		}

		if ($_('#game').isVisible ()
			&& !Monogatari.global ('distraction-free')
			&& !Monogatari.global ('block')) {
			promises.push (Promise.resolve ());
		} else {
			promises.push (Promise.reject ());
		}
		return Promise.all (promises);
	}

	static playAmbient () {
		if (Monogatari.setting ('MenuMusic') !== '') {
			Monogatari.ambientPlayer.setAttribute ('loop', '');

			if (typeof Monogatari.asset ('music', Monogatari.setting ('MenuMusic')) !== 'undefined') {
				Monogatari.ambientPlayer.setAttribute('src', 'audio/music/' + Monogatari.asset ('music', Monogatari.setting ('MenuMusic')));
			} else {
				Monogatari.ambientPlayer.setAttribute('src', 'audio/music/' + Monogatari.setting ('MenuMusic'));
			}
			Monogatari.ambientPlayer.play();
		}
	}

	// Stop the main menu's music
	static stopAmbient () {
		if (!Monogatari.ambientPlayer.paused) {
			Monogatari.ambientPlayer.pause ();
		}
	}

	// Stop the voice player
	static shutUp () {
		if (!Monogatari.voicePlayer.paused && typeof Monogatari.voicePlayer.src !== 'undefined' && Monogatari.voicePlayer.src != '') {
			Monogatari.voicePlayer.pause ();
			Monogatari.voicePlayer.currentTime = 0;
		}
	}

	static changeWindowResolution (resolution) {
		if (Platform.electron ()) {
			const remote = require ('electron').remote;
			const win = remote.getCurrentWindow ();
			const {width, height} = remote.screen.getPrimaryDisplay ().workAreaSize;
			if (resolution) {
				win.setResizable (true);

				if (resolution == 'fullscreen' && !win.isFullScreen () && win.isFullScreenable ()) {
					win.setFullScreen(true);
					Monogatari.preference ('Resolution', resolution);
				} else if (resolution.indexOf ('x') > -1) {
					win.setFullScreen (false);
					const size = resolution.split ('x');
					const chosenWidth = parseInt (size[0]);
					const chosenHeight = parseInt (size[1]);

					if (chosenWidth <= width && chosenHeight <= height) {
						win.setSize(chosenWidth, chosenHeight, true);
						Monogatari.preference ('Resolution', resolution);
					}
				}
				win.setResizable (false);
			}
		}
	}

	static electronSetup () {
		// Set the electron quit handler.
		if (Platform.electron ()) {
			const remote = require ('electron').remote;
			const win = remote.getCurrentWindow ();

			$_('[data-action="set-resolution"]').value (Monogatari.preference ('Resolution'));

			window.addEventListener ('beforeunload', (event) => {
				event.preventDefault ();
				$_('[data-notice="exit"]').addClass ('modal--active');
			});

			if (!win.isResizable ()) {
				const aspectRatio = Monogatari.setting ('AspectRatio').split (':');
				const aspectRatioWidth = parseInt (aspectRatio[0]);
				const aspectRatioHeight = parseInt (aspectRatio[1]);
				win.setResizable (true);
				const minSize = win.getMinimumSize ();
				const {width, height} = remote.screen.getPrimaryDisplay ().workAreaSize;
				win.setResizable (false);

				for (let i = 0; i < 488; i+=8) {
					const calculatedWidth = aspectRatioWidth * i;
					const calculatedHeight = aspectRatioHeight * i;

					if (calculatedWidth >= minSize[0] && calculatedHeight >= minSize[1] && calculatedWidth <= width && calculatedHeight <= height) {
						$_('[data-action="set-resolution"]').append(`<option value="${calculatedWidth}x${calculatedHeight}">${Monogatari.string ('Windowed')} ${calculatedWidth}x${calculatedHeight}</option>`);
					}
				}

				$_('[data-action="set-resolution"]').append(`<option value="fullscreen">${Monogatari.string ('FullScreen')}</option>`);

				Monogatari.changeWindowResolution (Monogatari.preference ('Resolution'));
				$_('[data-action="set-resolution"]').change(function () {
					const size = $_(this).value ();
					Monogatari.changeWindowResolution (size);
				});
			} else {
				$_('[data-settings="resolution"]').hide ();
			}

		} else {
			$_('[data-platform="electron"]').hide ();
		}
	}

	static resetGame () {

		$_('[data-component="modal"]').removeClass ('modal--active');


		clearInterval (Monogatari.global ('_AutoPlayTimer'));

		// TODO: Fix classes to use new Font Awesome classes
		$_('[data-action="auto-play"].fa').removeClass ('fa-stop-circle');
		$_('[data-action="auto-play"].fa').addClass ('fa-play-circle');

		// Reset Storage
		Monogatari.storage (JSON.parse(Monogatari.global ('storageStructure')));

		// Reset Conditions
		Monogatari.state ({
			step: 0,
			label: Monogatari.setting ('Label')
		});

		Monogatari.global ('block', false);

		// Reset History
		for (const history of Object.keys (Monogatari._history)) {
			Monogatari._history[history] = [];
		}

		const promises = [];
		for (const action of Monogatari.actions ()) {
			promises.push (action.reset ());
		}
		return Promise.all (promises);
	}

	static next () {
		Monogatari.state ({
			step: Monogatari.state ('step') + 1
		});
		Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
	}

	// Start game automatically withouth going trough the main menu
	static showMainMenu () {
		if (!Monogatari.setting ('ShowMenu')) {
			Monogatari.stopAmbient ();
			Monogatari.global ('playing', true);
			$_('section').hide ();
			$_('#game').show ();
			Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
		} else {
			$_('[data-menu="main"]').show ();
		}
	}

	static continue () {
		Monogatari.canProceed ().then (() => {
			if (!Monogatari.global ('finishedTyping') && Monogatari.global ('textObject') !== null) {
				const str = Monogatari.global ('textObject').strings [0];
				const element = $_(Monogatari.global ('textObject').el).data ('ui');
				Monogatari.global ('textObject').destroy ();
				if (element == 'centered') {
					$_('[data-ui="centered"]').html (str);
				} else {
					$_('[data-ui="say"]').html (str);
				}
				Monogatari.global ('finishedTyping', true);
			} else {
				Monogatari.action ('Centered').hide();
				Monogatari.shutUp();
				Monogatari.next ();
			}
		}).catch (() => {
			// An action waiting for user interaction or something else
			// is blocking the game.
		});
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//

	static autoPlay (enable) {
		if (enable === true) {
			const interval = Monogatari.preference ('AutoPlaySpeed') * 1000;
			let expected = Date.now () + interval;

			Monogatari.global ('_AutoPlayTimer', () => {
				const now = Date.now () - expected; // the drift (positive for overshooting)
				if (now > interval) {
					// something really bad happened. Maybe the browser (tab) was inactive?
					// possibly special handling to avoid futile "catch up" run
				}
				Monogatari.canProceed ().then (() => {
					Monogatari.action ('Centered').hide();
					Monogatari.shutUp();
					Monogatari.next ();
					expected += interval;
					setTimeout (Monogatari.global ('_AutoPlayTimer'), Math.max (0, interval - now)); // take into account drift
				}).catch (() => {
					// An action waiting for user interaction or something else
					// is blocking the game.
				});
			});
			setTimeout (Monogatari.global ('_AutoPlayTimer'), interval);
		} else {
			clearTimeout (Monogatari.global ('_AutoPlayTimer'));
		}

	}

	static object () {
		return {
			history: Monogatari.history (),
			state: Monogatari.state (),
			storage: Monogatari.storage ()
		};
	}

	// Function to execute the previous statement in the script.
	static revert () {

		Monogatari.action ('Centered').hide ();
		Monogatari.shutUp ();

		if (Monogatari.state ('step') >= 1) {

			for (const action of Monogatari.actions ()) {
				let actionStatement = Monogatari.label ()[Monogatari.state ('step') - 1];
				let matches = false;

				if (typeof actionStatement === 'string') {
					actionStatement = actionStatement.split (' ');
					matches = action.matchString (actionStatement);
				} else if (typeof actionStatement === 'object') {
					matches = action.matchObject (actionStatement);
				}

				if (matches === true) {
					const act = new action (actionStatement);

					act.setContext (Monogatari);

					return act.willRevert ().then (() => {
						return act.revert ().then (() => {
							return act.didRevert (). then ((shouldContinue) => {
								Monogatari.state ({
									step: Monogatari.state ('step') - 1
								});
								if (shouldContinue === true) {
									return Monogatari.revert ();
								}
							});
						});
					}).catch ((e) => {
						if (typeof e === 'object' || typeof e === 'string') {
							console.error (e);
						}

						return Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
					});
				}
			}
		} else {
			return Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
		}
		return Promise.reject ();
	}

	static run (statement, advance) {

		if (statement === null) {
			return Promise.reject ();
		}

		if (typeof advance !== 'boolean') {
			advance = true;
		}

		for (const action of Monogatari.actions ()) {
			let actionStatement = statement;
			let matches = false;

			if (typeof statement === 'string') {
				actionStatement = Monogatari.replaceVariables (statement).split (' ');
				matches = action.matchString (actionStatement);
			} else if (typeof statement === 'object') {
				matches = action.matchObject (statement);
			} else if (typeof actionStatement === 'function') {
				Monogatari.global ('block', true);
				return Util.callAsync (actionStatement, Monogatari).finally (() => {
					Monogatari.global ('block', false);
					if (advance) {
						return Monogatari.next ();
					}
				});
			}

			if (matches === true) {
				const act = new action (actionStatement);
				act._setStatement (statement);
				act.setContext (Monogatari);

				return act.willApply ().then (() => {
					return act.apply (advance).then (() => {
						return act.didApply ().then ((shouldContinue) => {
							if (shouldContinue === true && advance === true) {
								Monogatari.next ();
							}
						});
					});
				});
			}
		}
	}

	static setup (selector) {

		$_(selector).html (HTML);

		// Set the initial settings if they don't exist or load them.
		Monogatari.Storage.get ('Settings').then ((local_settings) => {
			Monogatari._preferences = Object.assign ({}, Monogatari._preferences, local_settings);
		}).catch (() => {
			Monogatari.Storage.set ('Settings', Monogatari._preferences);
		});

		// Register service worker
		if (Monogatari.setting ('ServiceWorkers')) {
			if (!Platform.electron () && !Platform.cordova () && Platform.serviceWorkers ()) {
				// TODO: There's a place in hell for this quick fix, the splitting
				// of the sw file is just preventing parcel from tryng to bundle it.
				navigator.serviceWorker.register ('./../service-worker' + '.js');
			} else {
				console.warn ('Service Workers are not available in this browser or have been disabled in the engine configuration. Service Workers are available only when serving your files through a server, once you upload your game this warning will go away. You can also try using a simple server like this one for development: https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb/');
			}
		}

		Monogatari.global ('storageStructure', JSON.stringify(Monogatari.storage ()));

		const promises = [];

		for (const component of Monogatari.components ()) {
			promises.push (component.setup (selector));
		}

		for (const action of Monogatari.actions ()) {
			promises.push (action.setup (selector));
		}
		return Promise.all (promises);
	}

	/**
	 * Every event listener should be binded in this function.
	 */
	static bind (selector) {
		// Fix for select labels
		$_('[data-select]').click (function () {
			const e = document.createEvent ('MouseEvents');
			e.initMouseEvent ('mousedown');
			$_(`[data-action='${$_(this).data ('select')}']`).get (0). dispatchEvent (e);
		});

		// Bind Language select so that every time a language is selected, the
		// ui and game get correctly localized.
		$_('[data-action="set-language"]').change (function () {
			Monogatari.preference ('Language', $_(this).value ());
			Monogatari.localize ();
		});

		// Add the orientation checker in case that a specific orientation was
		// defined.
		if (Monogatari.setting ('Orientation') !== 'any' && Platform.mobile ()) {

			// Set the event listener for device orientation so we can display a message
			window.addEventListener ('orientationchange', () => {
				if (Platform.orientation () !== Monogatari.setting ('Orientation')) {
					$_('[data-notice="orientation"]').addClass ('modal--active');
				} else {
					$_('[data-notice="orientation"]').removeClass ('modal--active');
				}
			}, false);
		}

		// Add event listener for back buttons. If the player is plaing, the back
		// button will return to the game, if its not playing, then it'll return
		// to the main menu.
		$_('[data-menu]').on ('click', '[data-action="back"]:not(#game), [data-action="back"]:not(#game) *', () => {
			//event.stopPropagation ();
			$_('section').hide ();
			if (Monogatari.global ('playing')) {
				$_('#game').show ();
			} else {
				$_('[data-menu="main"]').show ();
			}
		});

		$_('#game [data-ui="quick-menu"], #game [data-ui="quick-menu"] *').click ((event) => {
			// Clicked Child
			event.stopPropagation ();
		});

		$_('#game').click (function () {
			Monogatari.continue ();
		});

		$_('[data-action], [data-action] *').click(function () {

			switch ($_(this).data('action')) {

				case 'open-menu':
					$_('section').hide();

					if ($_(this).data('open') == 'save') {
						$_('[data-menu="save"] [data-input="slotName"]').value (Monogatari.niceDateTime ());
					}
					$_('[data-menu="' + $_(this).data('open') + '"]').show();

					break;

				case 'start':
					Monogatari.stopAmbient();
					Monogatari.global ('playing', true);

					Monogatari.onStart ().then (() => {
						$_('section').hide();
						$_('#game').show();
						Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
					});
					break;

				case 'close':
					$_('[data-ui="' + $_(this).data('close') + '"]').removeClass('active');
					break;

				case 'dismiss-notice':
					$_('[data-notice]').removeClass('modal--active');
					break;

				case 'distraction-free':
					if ($_(this).hasClass('fa-eye')) {
						$_(this).removeClass('fa-eye');
						$_(this).addClass('fa-eye-slash');
						$_(this).parent ().find ('[data-string]').text (Monogatari.string ('Show'));
						$_('[data-ui="quick-menu"]').addClass ('transparent');
						$_('[data-ui="text"]').hide();
						Monogatari.global ('distraction-free', true);
					} else if ($_(this).hasClass('fa-eye-slash')) {
						$_(this).removeClass('fa-eye-slash');
						$_(this).addClass('fa-eye');
						$_(this).parent ().find ('[data-string]').text (Monogatari.string ('Hide'));
						$_('[data-ui="quick-menu"]').removeClass ('transparent');
						$_('[data-ui="text"]').show();
						Monogatari.global ('distraction-free', false);
					} else if ($_(this).text () === Monogatari.string ('Show')) {
						$_(this).text (Monogatari.string('Hide'));
						$_(this).parent ().find ('.fas').removeClass ('fa-eye-slash');
						$_(this).parent ().find ('.fas').addClass ('fa-eye');
						$_('[data-ui="quick-menu"]').removeClass ('transparent');
						$_('[data-ui="text"]').show ();
						Monogatari.global ('distraction-free', false);
					} else if ($_(this).text () === Monogatari.string ('Hide')) {
						$_(this).text (Monogatari.string ('Show'));
						$_(this).parent ().find ('.fas').removeClass ('fa-eye');
						$_(this).parent ().find ('.fas').addClass ('fa-eye-slash');
						$_('[data-ui="quick-menu"]').addClass ('transparent');
						$_('[data-ui="text"]').hide ();
						Monogatari.global ('distraction-free', true);
					}
					break;
			}
			return false;
		});

		$_('#game [data-action="back"], #game [data-action="back"] *').click ((event) => {
			event.stopPropagation ();
			Monogatari.canRevert ().then (() => {
				Monogatari.revert ().catch (() => {
					// The game could not be reverted, either because an
					// action prevented it or because there are no statements
					// left to revert to.
				});
			}).catch (() => {
				// An action waiting for user interaction or something else
				// is blocking the game.
			});
		});

		$_('[data-action="set-auto-play-speed"]').on ('change mouseover', function () {
			const value = Monogatari.setting ('maxAutoPlaySpeed') - parseInt($_(this).value());
			Monogatari.preference ('AutoPlaySpeed', value);
		});

		$_('[data-action="auto-play"], [data-action="auto-play"] *').click(function () {
			if ($_(this).hasClass('fa-play-circle')) {
				$_(this).removeClass('fa-play-circle');
				$_(this).addClass('fa-stop-circle');
				Monogatari.autoPlay (true);
			} else if ($_(this).hasClass('fa-stop-circle')) {
				$_(this).removeClass('fa-stop-circle');
				$_(this).addClass('fa-play-circle');
				Monogatari.autoPlay (false);
			} else if ($_(this).text () === Monogatari.string ('AutoPlay')) {
				$_(this).text (Monogatari.string('Stop'));
				Monogatari.autoPlay (true);
			} else if ($_(this).text () === Monogatari.string ('Stop')) {
				$_(this).text (Monogatari.string ('AutoPlay'));
				Monogatari.autoPlay (false);
			}
		});

		$_(document).keyup ((e) => {
			if (e.target.tagName.toLowerCase () != 'input') {
				switch (e.which) {

					// Escape Key
					case 27:
						if ($_('#game').isVisible ()) {
							$_('#game').hide ();
							$_('[data-menu="settings"]').show();
						} else if ($_('[data-menu="settings"]').isVisible () && Monogatari.global ('playing')) {
							$_('[data-menu="settings"]').hide ();
							$_('#game').show ();
						}
						break;

					// Spacebar and Right Arrow
					case 32:
					case 39:
						Monogatari.continue ();
						break;

					// Left Arrow
					case 37:
						Monogatari.revert ().catch (() => {
							// The game could not be reverted, either because an
							// action prevented it or because there are no statements
							// left to revert to.
						});
						break;

					// H Key
					case 72:
						event.stopPropagation();
						if ($_('[data-action="distraction-free"]').hasClass ('fa-eye')) {
							$_('[data-action="distraction-free"]').removeClass ('fa-eye');
							$_('[data-action="distraction-free"]').addClass ('fa-eye-slash');
							$_('[data-ui="text"]').hide ();
							Monogatari.global ('distraction-free', true);
						} else if ($_('[data-action="distraction-free"]').hasClass ('fa-eye-slash')) {
							$_('[data-action="distraction-free"]').removeClass ('fa-eye-slash');
							$_('[data-action="distraction-free"]').addClass ('fa-eye');
							$_('[data-ui="text"]').show ();
							Monogatari.global ('distraction-free', false);
						}
						break;

					// Exit this handler for other keys to run normally
					default:
						return;
				}
			}

			e.preventDefault();
		});

		const promises = [];

		for (const component of Monogatari.components ()) {
			promises.push (component.bind (selector));
		}

		for (const action of Monogatari.actions ()) {
			promises.push (action.bind (selector));
		}
		return Promise.all (promises);
	}

	static init (selector = '#monogatari') {
		Monogatari.selector = selector;
		FancyError.init ();

		Monogatari.setup (selector).then (() => {
			Monogatari.bind (selector).then (() => {
				// Set the game language or hide the option if the game is not multilingual
				if (Monogatari.setting ('MultiLanguage')) {
					$_('[data-action="set-language"]').value (Monogatari.preference ('Language'));
				} else {
					$_('[data-settings="language"]').hide ();
				}

				// Set the initial language translations
				Monogatari.localize ();

				// Set the label in which the game will start
				Monogatari.state ({
					label: Monogatari.setting ('Label')
				});

				// Check if the orientation is correct, if it's not, show the warning
				// message so the player will rotate its device.
				if (Platform.mobile () && Platform.orientation () !== Monogatari.setting ('Orientation')) {
					$_('[data-notice="orientation"]').addClass ('modal--active');
				}

				// Set all the dynamic backgrounds of the data-background property
				$_('[data-background]').each ((element) => {
					const background = $_(element).data ('background');
					if (background.indexOf ('.') > -1) {
						$_(element).style ('background', `url('${background}') center / cover no-repeat`);
					} else {
						$_(element).style ('background', background);
					}
				});

				// Disable audio settings in iOS since they are not supported
				if (Platform.mobile ('iOS')) {
					// iOS handles the volume using the system volume, therefore there is now way to
					// handle each of the sound sources individually and as such, this is disabled.
					$_('[data-settings="audio"]').html (`<p>${Monogatari.string ('iOSAudioWarning')}</p>`);
				}

				Monogatari.electronSetup ();

				Monogatari.preload ().then(() => {
					$_('[data-menu="loading"]').fadeOut (400, () => {
						$_('[data-menu="loading"]').hide ();
					});
				}).catch ((e) => {
					console.error (e);
				}).finally (() => {
					Monogatari.showMainMenu ();
				});

				Monogatari.setting ('maxAutoPlaySpeed', parseInt ($_('[data-action="set-auto-play-speed"]').property ('max')));
				document.querySelector('[data-action="set-auto-play-speed"]').value = Monogatari.preference ('AutoPlaySpeed');

				for (const component of Monogatari.components ()) {
					component.init (selector);
				}

				for (const action of Monogatari.actions ()) {
					action.init (selector);
				}

				// Play the main menu song
				Monogatari.playAmbient();
			});
		});
	}
}

Monogatari._actions = [];
Monogatari._components = [];
Monogatari._translations = {};
Monogatari._script = {};
Monogatari._characters = {};
Monogatari._storage = {};

Monogatari._state = {
	step: 0,
	label: 'Start'
};

Monogatari._history = {
	image: [],
	character: [],
	scene: [],
	label: []
};

Monogatari._globals = {

};

Monogatari._functions = {

};

Monogatari._status = {
	block: false,
	playing: false,
	finishedTyping: true
};

Monogatari._assets = {
	music: {},
	voice: {},
	sound: {},
	video: {},
	images: {},
	scenes: {}
};

Monogatari._settings = {

	// Initial Label *
	'Label': 'Start',

	// Number of AutoSave Slots
	'Slots': 10,

	// Change to true for a MultiLanguage Game.
	'MultiLanguage': false,

	// Music for the Main Menu.
	'MenuMusic': '',

	// Prefix for the Save Slots in Local Storage.
	'SaveLabel': 'Save',
	'AutoSaveLabel': 'AutoSave',

	// Turn main menu on/off; Default: true *
	'ShowMenu': true,

	// Turn image preloading on/off, Default: true
	'Preload': true,

	// Time interval between autosaves (In Minutes). Default: 0 (Off)
	'AutoSave': 0,

	// Enable service workers; Default: true *
	'ServiceWorkers': true,

	// The Aspect Ratio your background images are on. This has no effect on
	// web deployed novels.
	'AspectRatio': '16:9',

	// Enables or disables the typing text animation for the whole game.
	'TypeAnimation': true,

	// Enables or disables the typing animation for the narrator.
	// If the previous property was set to false, the narrator won't shown
	// the animation even if this is set to true.
	'NarratorTypeAnimation': true,

	// Enables or disables the typing animation for the special centered
	// character. If the TypeAnimation property was set to false, the centered
	// character won't shown the animation even if this is set to true.
	'CenteredTypeAnimation': true,

	// Force some orientation on mobile devices. If this setting is set either
	// to portrait or landscape, a warning message will be displayed so the
	// player rotates its device.
	// Possible values: any, portrait or landscape.
	'Orientation': 'any'
};

Monogatari._preferences = {

	// Initial Language for Multilanguage Games or for the Default GUI Language.
	'Language': 'English',

	// Initial Volumes from 0.0 to 1.
	'Volume': {
		'Music': 1,
		'Voice': 1,
		'Sound': 1
	},

	// Initial resolution used for Electron, it must match the settings inside
	// the electron.js file. This has no effect on web deployed novels.
	'Resolution': '800x600',

	// Speed at which dialog text will appear
	'TextSpeed': 20,

	// Speed at which the Auto Play feature will show the next statement
	// It is measured in seconds and starts counting after the text is
	// completely displayed.
	'AutoPlaySpeed': 5
};

Monogatari.globals ({
	autoPlay: null,
	'distraction-free': false,
	deleteSlot: null,
	overwriteSlot: null,
	block: false,
	playing: false,
	currentAutoSaveSlot: 1
});

Monogatari.Storage = new Space ();

export { Monogatari };