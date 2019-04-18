import { Action } from './../lib/Action';
import { Monogatari } from '../monogatari';
import Typed from 'typed.js';
import { $_ } from '@aegis-framework/artemis';

export class Dialog extends Action {

	static shouldProceed () {

		// Check if the type animation has finished and the Typed object still exists
		if (!Monogatari.global ('finishedTyping') && Monogatari.global ('textObject') !== null) {

			// Get the string it was typing
			const str = Monogatari.global ('textObject').strings [0];

			// Get the element it was typing to
			const element = Monogatari.global ('textObject').el;

			Monogatari.global ('textObject').destroy ();

			element.innerHTML = str;

			Monogatari.global ('finishedTyping', true);

			return Promise.reject ('TypeWriter effect has not finished.');
		}
		return Promise.resolve (Monogatari.global ('finishedTyping'));
	}

	static willProceed () {
		if (Monogatari.global ('finishedTyping') && Monogatari.element ().find (`[data-component"centered-dialog"]`).isVisible ()) {
			Monogatari.element ().find (`[data-component="text-box"]`).show ('flex');
		}
		return Promise.resolve (Monogatari.global ('finishedTyping'));
	}

	static willRollback () {
		Monogatari.global ('textObject').destroy ();
		Monogatari.global ('finishedTyping', true);
		Monogatari.global ('_CurrentChoice', null);
		Monogatari.element ().find ('[data-component="text-box"]').show ('flex');

		const dialogLog = Monogatari.component ('dialog-log');

		if (typeof dialogLog !== 'undefined') {
			dialogLog.instances (instance => instance.pop ());
		}
		return Promise.resolve ();
	}

	static setup () {
		Monogatari.globals ({
			textObject: null,
			finishedTyping: true,
			typedConfiguration: {
				strings: [],
				typeSpeed: Monogatari.preference ('TextSpeed'),
				fadeOut: true,
				loop: false,
				showCursor: false,
				contentType: 'html',
				preStringTyped: () => {
					Monogatari.global ('finishedTyping', false);
				},
				onStringTyped: () => {
					Monogatari.global ('finishedTyping', true);
				},
				onDestroy () {
					Monogatari.global ('finishedTyping', true);
				}
			}
		});

		// The NVL mode has its own history so that when going back, all dialogs
		// that were shown on screen can be shown again instead of just showing
		// the last one.
		Monogatari.history ('nvl');

		return Promise.resolve ();
	}

	static bind (selector) {
		// Add listener for the text speed setting
		$_(`${selector} [data-action="set-text-speed"]`).on ('change mouseover', function () {
			const value =  Monogatari.setting ('maxTextSpeed') - parseInt($_(this).value());
			Monogatari.global ('typedConfiguration').typeSpeed = value;
			Monogatari.preference ('TextSpeed', value);
		});

		// Detect scroll on the text element to remove the unread class used when
		// there's text not being shown in NVL mode.
		$_(`${selector} text-box`).on ('scroll', () => {
			Monogatari.element ().find ('text-box').removeClass ('unread');
		});
		return Promise.resolve ();
	}

	static init (selector) {
		// Remove the Text Speed setting if the type animation was disabled
		if (Monogatari.setting ('TypeAnimation') === false) {
			$_(`${selector} [data-settings="text-speed"]`).hide ();
		}

		Monogatari.setting ('maxTextSpeed', parseInt ($_(`${selector} [data-action="set-text-speed"]`).property ('max')));


		//document.querySelector('[data-action="set-text-speed"]').value = Monogatari.preference ('TextSpeed');

		return Promise.resolve ();
	}

	static reset () {
		if (Monogatari.global ('textObject') !== null) {
			Monogatari.global ('textObject').destroy ();
		}

		Monogatari.element ().find ('text-box').removeClass ('nvl');

		Monogatari.element ().find ('text-box').data ('speaking', '');

		Monogatari.element ().find ('[data-ui="who"]').style ('color', '');

		Monogatari.element ().find ('[data-ui="who"]').html ('');
		Monogatari.element ().find ('[data-ui="say"]').html ('');
		return Promise.resolve ();
	}

	static matchString () {
		return true;
	}

	constructor ([ character, ...dialog ]) {
		super ();

		const [ id, expression ] = character.split (':');

		this.dialog = dialog.join (' ');

		this.nvl = false;

		if (typeof Monogatari.character (id) !== 'undefined') {
			this.character = Monogatari.character (id);
			this.id = id;

			if (typeof this.character.nvl !== 'undefined') {
				this.nvl = this.character.nvl;
			}

			if (typeof expression !== 'undefined') {
				if (typeof this.character.expressions !== 'undefined') {
					if (typeof this.character.directory !== 'undefined') {
						this.image = `${this.character.directory}/${this.character.expressions[expression]}`;
					} else {
						this.image = this.character.expressions[expression];
					}
				}

			} else if (typeof this.character.default_expression !== 'undefined') {
				if (typeof this.character.directory !== 'undefined') {
					this.image = `${this.character.directory}/${this.character.default_expression}`;
				} else {
					this.image = this.character.default_expression;
				}
			}
		} else if (id === 'centered') {
			this.id = 'centered';
		} else {
			this.id = 'narrator';
			if (id === 'nvl') {
				this.nvl = true;
			} else {
				this.dialog = `${character} ${this.dialog}`;
			}
		}
	}

	willApply () {
		Monogatari.element ().find ('[data-character]').removeClass ('focus');
		Monogatari.element ().find ('[data-ui="face"]').hide ();
		document.querySelector ('[data-ui="who"]').innerHTML = '';
		return Promise.resolve ();
	}

	displayCenteredDialog (dialog, character, animation) {
		const element = document.createElement ('centered-dialog');
		this.engine.element ().find ('[data-screen="game"]').append (element);

		if (animation) {
			Monogatari.global ('typedConfiguration').strings = [dialog];
			Monogatari.global ('textObject', new Typed (`${Monogatari.selector ()} [data-component="centered-dialog"] [data-content="wrapper"]`, Monogatari.global ('typedConfiguration')));
		} else {
			element.content ('wrapper').html (dialog);
		}

		return Promise.resolve ();
	}

	displayNvlDialog (dialog, character, animation) {
		if (!Monogatari.element ().find ('text-box').hasClass ('nvl')) {
			Dialog.reset ();
			Monogatari.element ().find ('text-box').addClass ('nvl');
		}

		// Remove contents from the dialog area.
		const previous = Monogatari.element ().find ('text-box').data ('speaking');
		Monogatari.element ().find ('text-box').data ('speaking', character);

		// Check if the typing animation flag is set to true in order to show it
		if (animation === true && Monogatari.setting ('TypeAnimation') === true && Monogatari.setting ('NVLTypeAnimation') === true) {

			// If the property is set to true, the animation will be shown
			// if it is set to false, even if the flag was set to true,
			// no animation will be shown in the game.
			if (character !== 'narrator') {
				if (previous !== character) {
					Monogatari.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}" class='named'><span style='color:${Monogatari.character (character).color};'>${Monogatari.replaceVariables (Monogatari.character (character).name)}: </span><p></p></div>`);
				} else {
					Monogatari.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}"><p></p></div>`);
				}

			} else {
				Monogatari.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}" class='unnamed'><p></p></div>`);
			}

			const elements = $_('[data-ui="say"] [data-spoke] p');
			const last = elements.last ().get (0);

			Monogatari.global ('typedConfiguration').strings = [dialog];
			Monogatari.global ('textObject', new Typed (last, Monogatari.global ('typedConfiguration')));

		} else {
			if (character !== 'narrator') {
				if (previous !== character) {
					Monogatari.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}" class='named'><span style='color:${Monogatari.character (character).color};'>${Monogatari.replaceVariables (Monogatari.character (character).name)}: </span><p>${dialog}</p></div>`);
				} else {
					Monogatari.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}"><p>${dialog}</p></div>`);
				}

			} else {
				Monogatari.element ().find ('[data-ui="say"]').append (`<div data-spoke="${character}" class='unnamed'><p>${dialog}</p></div>`);
			}
			Monogatari.global ('finishedTyping', true);
		}
	}

	displayDialog (dialog, character, animation) {
		if (this.nvl === false) {
			if (Monogatari.element ().find ('text-box').hasClass ('nvl') && this._cycle === 'Application') {
				Monogatari.history ('nvl').push (Monogatari.element ().find ('text-box [data-ui="say"]').html ());
			}
			Monogatari.element ().find ('text-box').removeClass ('nvl');

			// Destroy the previous textObject so the text is rewritten.
			// If not destroyed, the text would be appended instead of replaced.
			if (Monogatari.global ('textObject') !== null) {
				Monogatari.global ('textObject').destroy ();
			}

			// Remove contents from the dialog area.
			Monogatari.element ().find ('[data-ui="say"]').html ('');
			Monogatari.element ().find ('text-box').data ('speaking', character);

			// Check if the typing animation flag is set to true in order to show it
			if (animation === true && Monogatari.setting ('TypeAnimation') === true) {

				// If the property is set to true, the animation will be shown
				// if it is set to false, even if the flag was set to true,
				// no animation will be shown in the game.
				Monogatari.global ('typedConfiguration').strings = [dialog];
				Monogatari.global ('textObject', new Typed ('[data-ui="say"]', Monogatari.global ('typedConfiguration')));
			} else {
				Monogatari.element ().find ('[data-ui="say"]').html (dialog);
				Monogatari.global ('finishedTyping', true);
			}
		} else {
			this.displayNvlDialog (dialog, character, animation);
		}

		return Promise.resolve ();
	}


	characterDialog () {
		// Check if the character has a name to show
		if (typeof this.character.name !== 'undefined' && !this.nvl) {
			Monogatari.element ().find ('[data-ui="who"]').html (Monogatari.replaceVariables (this.character.name));
		}

		let directory = this.character.directory;

		if (typeof directory == 'undefined') {
			directory = '';
		} else {
			directory += '/';
		}

		// Focus the character's sprite and colorize it's name with the defined
		// color on its declaration
		Monogatari.element ().find (`[data-character="${this.id}"]`).addClass ('focus');
		Monogatari.element ().find ('[data-ui="who"]').style ('color', this.character.color);

		// Check if an expression or face image was used and if it exists and
		// display it
		if (typeof this.image !== 'undefined' && !this.nvl) {
			`${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').characters}/${directory}${this.image}`
			Monogatari.element ().find ('[data-ui="face"]').attribute ('src', `${Monogatari.setting ('AssetsPath').root}/${Monogatari.setting ('AssetsPath').characters}/${directory}${this.image}/${directory}${this.image}`);
			Monogatari.element ().find ('[data-ui="face"]').show ();
		}

		// Check if the character object defines if the type animation should be used.
		if (typeof this.character.type_animation !== 'undefined') {
			return this.displayDialog (this.dialog, this.id, this.character.type_animation);
		} else {
			return this.displayDialog (this.dialog, this.id, true);
		}
	}

	apply () {
		try {
			const dialogLog = Monogatari.component ('dialog-log');
			if (typeof dialogLog !== 'undefined') {
				if (this._cycle === 'Application') {
					dialogLog.instances (instance => instance.write ({
						id: this.id,
						character: this.character,
						dialog: this.dialog
					}));
				} else {
					dialogLog.instances (instance => instance.pop ());
				}
			}
		} catch (e) {
			Monogatari.debug.error (e);
		}

		if (typeof this.character !== 'undefined') {
			return this.characterDialog ();
		} else if (this.id === 'centered') {
			return this.displayCenteredDialog (this.dialog, this.id, Monogatari.setting ('CenteredTypeAnimation'));
		} else {
			return this.displayDialog (this.dialog, 'narrator', Monogatari.setting ('NarratorTypeAnimation'));
		}
	}

	willRevert () {
		Monogatari.element ().find ('[data-character]').removeClass ('focus');
		Monogatari.element ().find ('[data-ui="face"]').hide ();
		document.querySelector ('[data-ui="who"]').innerHTML = '';
		return Promise.resolve ();
	}

	revert () {
		// Check if the dialog to replay is a NVL one or not
		if (this.nvl === true) {
			//  Check if the NVL screen is currently being shown
			if (Monogatari.element ().find ('text-box').hasClass ('nvl')) {
				// If it is being shown, then to go back, we need to remove the last dialog from it
				Monogatari.element ().find ('text-box [data-ui="say"] [data-spoke]').last ().remove ();
				return Promise.resolve ();
			} else {
				// If it is not shown right now, then we need to recover the dialogs
				// that were being shown the last time we hid it
				if (Monogatari.history ('nvl').length > 0) {
					Monogatari.element ().find ('text-box').addClass ('nvl');
					Monogatari.element ().find ('text-box [data-ui="say"]').html (Monogatari.history ('nvl').pop ());
					return Promise.resolve ();
				}
				return Promise.reject ();
			}
		} else {
			// If the dialog was not NVL, we can simply show it as if we were
			// doing a simple application
			return this.apply ();
		}
	}

	didRevert () {
		return Promise.resolve ({ advance: false, step: true });
	}

}

Dialog.id = 'Dialog';

Monogatari.registerAction (Dialog);