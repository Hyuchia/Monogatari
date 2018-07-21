import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';
import { FancyError } from '../FancyError';

export class Jump extends Action {

	static setup () {
		Monogatari.history ('label');
		Monogatari.history ('jump');
		return Promise.resolve ();
	}

	static bind (selector) {
		$_(`${selector}`).on ('click', '[data-action="jump"]', function () {
			Monogatari.run (`jump ${$_(this).data('jump')}`, false);
		});
		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'jump';
	}

	constructor ([ action, label ]) {
		super ();
		this.label = label;
	}

	willApply () {
		if (typeof Monogatari.script (this.label) !== 'undefined') {
			Monogatari.stopAmbient ();
			$_(`${Monogatari.selector} section`).hide ();
			$_(`${Monogatari.selector} #game`).show ();
			return Promise.resolve ();
		} else {
			FancyError.show (
				`The label "${this.label}" does not exist`,
				`Monogatari attempted to jump to the label named "${this.label}" but it wasn't found on the script.`,
				{
					'Missing Label': this.label,
					'You may have meant one of these': Object.keys (Monogatari.script ()),
					'Statement': `<code class='language=javascript'>"${this._statement}"</code>`,
					'Label': Monogatari.state ('label'),
					'Step': Monogatari.state ('step'),
					'Help': {
						'_': 'Check if the label in your jump statement is correct and that you have also defined it correctly.'
					}
				}
			);
		}
		return Promise.reject ();
	}

	apply () {
		Monogatari.history ('jump').push ({
			from: Monogatari.state ('label'),
			to: this.label,
			step: Monogatari.state ('step')
		});
		Monogatari.state ({
			step: 0,
			label: this.label
		});
		Monogatari.action ('Dialog').reset ();
		Monogatari.run (Monogatari.label ()[Monogatari.state ('step')]);
		Monogatari.history ('label').push (this.label);

		return Promise.resolve ();
	}

	// Jump is right now not reversible due to complications with the logic for it
	willRevert () {
		return Promise.reject ();
	}

	revert () {
		Monogatari.history ('label').pop ();
		const last = Monogatari.history ('jump').pop ();
		if (typeof last !== 'undefined') {
			Monogatari.state ({
				step: last.step,
				label: last.from
			});
			Monogatari.action ('Dialog').reset ();
		}
		return Promise.resolve ();
	}
}

Jump.id = 'Jump';

Monogatari.registerAction (Jump);