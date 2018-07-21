import { Action } from '../Action';
import { Monogatari } from '../monogatari';
import { $_ } from '@aegis-framework/artemis';

/* global particlesJS, pJSDom */

export class Particles extends Action {

	static configuration (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Particles._configuration[object];
			} else {
				Particles._configuration = Object.assign ({}, Particles._configuration, object);
			}
		} else {
			return Particles._configuration;
		}
	}

	static setup () {
		Monogatari.history ('particles');
		Monogatari.state ({
			particles: ''
		});
		return Promise.resolve ();
	}

	static reset () {
		Monogatari.state ({
			particles: ''
		});
		return Promise.resolve ();
	}

	static onLoad () {
		const { particles } = Monogatari.state ();
		if (particles !== '') {
			Monogatari.run (particles, false);
			// TODO: Find a way to prevent the histories from filling up on loading
			// So there's no need for this pop.
			Monogatari.history ('particles').pop ();
		}
		return Promise.resolve ();
	}

	static matchString ([ action ]) {
		return action === 'particles';
	}

	static stop () {
		try {
			if (typeof pJSDom === 'object') {
				if (pJSDom.length > 0) {
					for (let i = 0; i < pJSDom.length; i++) {
						if (typeof pJSDom[i].pJS !== 'undefined') {
							cancelAnimationFrame (pJSDom[i].pJS.fn.drawAnimFrame);
							pJSDom.shift ();
						}
					}
				}
			}
		} catch (e) {
			console.error ('An error ocurred while trying to stop particle system.');
		}

		Monogatari.state ({
			particles: ''
		});
		$_(`${Monogatari.selector} #particles-js`).html ('');
	}

	static particles (object = null) {
		if (object !== null) {
			if (typeof object === 'string') {
				return Particles._configuration.particles[object];
			} else {
				Particles._configuration.particles = Object.assign ({}, Particles._configuration.particles, object);
			}
		} else {
			return Particles._configuration.particles;
		}
	}

	constructor ([ action, name ]) {
		super ();
		if (typeof Particles.particles (name) !== 'undefined') {
			this.particles = Particles.particles (name);
			this.name = name;
		} else {
			console.error (`The Particles ${name} could not be shown because it doesn't exist in the particles object.`);
		}
	}

	willApply () {
		if (typeof this.particles !== 'undefined') {
			return Promise.resolve ();
		} else {
			return Promise.reject ();
		}
	}

	apply () {
		particlesJS (this.particles);
		Monogatari.history ('particles').push (this._statement);
		Monogatari.state ({
			particles: this._statement
		});
		return Promise.resolve ();
	}

	didApply () {
		return Promise.resolve (true);
	}

	revert () {
		Particles.stop ();
		Monogatari.history ('particles').pop ();
		return Promise.resolve ();
	}

	didRevert () {
		return Promise.resolve (true);
	}
}

Particles.id = 'Particles';
Particles._configuration = {
	particles: {}
};

Monogatari.registerAction (Particles);