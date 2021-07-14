/**
 * =============================================================================
 * Monogatari Core Engine
 * =============================================================================
 */

/**
 * =============================================================================
 * Global Vendor Libraries
 * -----------------------------------------------------------------------------
 * These are third party libraries that must be globally imported in order for
 * Monogatari to work correctly.
 * =============================================================================
 */

// Make babel use the polyfill as the package has been deprecated in favor of
// this:
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// TODO: Find a way to import Font Awesome in a better way
import './../node_modules/@fortawesome/fontawesome-free/js/all.js';

/**
 * =============================================================================
 * Exported Vendor Libraries
 * -----------------------------------------------------------------------------
 * These are third party libraries that Monogatari uses for certain functions
 * and may be helpful for the developers.
 * =============================================================================
 */

export * from '@aegis-framework/artemis';
export * from './lib/vendor/typed.min.js';
export * from 'random-js';
export * from 'tsparticles';

import Monogatari from './monogatari';

/**
 * =============================================================================
 * Translations
 * -----------------------------------------------------------------------------
 * Import all the translations available for the UI
 * =============================================================================
 */

import arabic from './translations/العربية';
import belarusian from './translations/Беларуская';
import chinese from './translations/简体中文';
import dutch from './translations/Nederlands';
import english from './translations/English';
import french from './translations/Français';
import german from './translations/Deutsch';
import hungarian from './translations/Hungarian';
import indonesian from './translations/Bahasa_Indonesia';
import japanese from './translations/日本語';
import korean from './translations/한국어';
import portuguese from './translations/Português';
import russian from './translations/Russian';
import spanish from './translations/Español';
import tokipona from './translations/tokipona';


Monogatari._translations = {
	'Bahasa Indonesia': indonesian,
	'Беларуская': belarusian,
	'Deutsch': german,
	'English': english,
	'Español': spanish,
	'Français': french,
	'Magyar': hungarian,
	'Nederlands': dutch,
	'Português': portuguese,
	'Русский': russian,
	'اللغه العربية': arabic,
	'한국어': korean,
	'日本語': japanese,
	'简体中文': chinese,
	'toki pona': tokipona,
};

Monogatari._languageMetadata = {
	'Bahasa Indonesia':{
		code: 'id',
		icon: '🇮🇩',
	},
	'Беларуская': {
		code: 'be',
		icon: '🇧🇾'
	},
	'Deutsch': {
		code: 'de',
		icon: '🇩🇪'
	},
	'English': {
		code: 'en',
		icon: '🇺🇸'
	},
	'Español': {
		code: 'es',
		icon: '🇲🇽'
	},
	'Français': {
		code: 'fr',
		icon: '🇫🇷'
	},
	'Magyar': {
		code: 'hu',
		icon: '🇭🇺'
	},
	'Nederlands': {
		code: 'nl',
		icon: '🇳🇱'
	},
	'Português': {
		code: 'pt',
		icon: '🇧🇷'
	},
	'Русский': {
		code: 'ru',
		icon: '🇷🇺'
	},
	'اللغه العربية': {
		code: 'ar',
		icon: '🇦🇪'
	},
	'한국어': {
		code: 'ko',
		icon: '🇰🇷'
	},
	'日本語': {
		code: 'ja',
		icon: '🇯🇵'
	},
	'简体中文': {
		code: 'zh',
		icon: '🇨🇳'
	},
	'toki pona': {
		code: 'en',
		icon: '🕮'
	},
};

/**
 * =============================================================================
 * Components
 * -----------------------------------------------------------------------------
 * Import all the core components used by Monogatari. These components are the
 * ones that describe the behavior and appearance of all the custom elements.
 * =============================================================================
 */

import AlertModal from './components/alert-modal';
import CanvasContainer from './components/canvas-container';
import CenteredDialog from './components/centered-dialog';
import CharacterSprite from './components/character-sprite';
import ChoiceContainer from './components/choice-container';
import CreditsScreen from './components/credits-screen';
import DialogLog from './components/dialog-log';
import GalleryScreen from './components/gallery-screen';
import GameScreen from './components/game-screen';
import HelpScreen from './components/help-screen';
import LanguageSelectionScreen from './components/language-selection-screen';
import LoadScreen from './components/load-screen';
import LoadingScreen from './components/loading-screen';
import MainMenu from './components/main-menu';
import MainScreen from './components/main-screen';
import MessageModal from './components/message-modal';
import QuickMenu from './components/quick-menu';
import SaveScreen from './components/save-screen';
import SaveSlot from './components/save-slot';
import SettingsScreen from './components/settings-screen';
import SlotContainer from './components/slot-container';
import TextBox from './components/text-box';
import TextInput from './components/text-input';
import TimerDisplay from './components/timer-display';
import VisualNovel from './components/visual-novel';

Monogatari._components = [
	AlertModal,
	CanvasContainer,
	CenteredDialog,
	CharacterSprite,
	ChoiceContainer,
	CreditsScreen,
	DialogLog,
	GalleryScreen,
	GameScreen,
	HelpScreen,
	LanguageSelectionScreen,
	LoadScreen,
	LoadingScreen,
	MainMenu,
	MainScreen,
	MessageModal,
	QuickMenu,
	SaveScreen,
	SaveSlot,
	SettingsScreen,
	SlotContainer,
	TextBox,
	TextInput,
	TimerDisplay,
	VisualNovel,
];

/**
 * =============================================================================
 * Actions
 * -----------------------------------------------------------------------------
 * Import all the core actions available. These actions are the ones that define
 * the allowed statements on a script and what they do.
 * =============================================================================
 */

import Canvas from './actions/Canvas.js';
import Choice from './actions/Choice.js';
import Clear from './actions/Clear.js';
import Conditional from './actions/Conditional.js';
import Dialog from './actions/Dialog.js';
import End from './actions/End.js';
import Function from './actions/Function.js';
import Gallery from './actions/Gallery.js';
import HideCanvas from './actions/HideCanvas.js';
import HideCharacter from './actions/HideCharacter.js';
import HideCharacterLayer from './actions/HideCharacterLayer.js';
import HideImage from './actions/HideImage.js';
import HideParticles from './actions/HideParticles.js';
import HideVideo from './actions/HideVideo.js';
import InputModal from './actions/InputModal.js';
import Jump from './actions/Jump.js';
import Message from './actions/Message.js';
import Next from './actions/Next.js';
import Notify from './actions/Notify.js';
import Particles from './actions/Particles.js';
import Pause from './actions/Pause.js';
import Placeholder from './actions/Placeholder';
import Play from './actions/Play.js';
import Scene from './actions/Scene.js';
import ShowBackground from './actions/ShowBackground.js';
import ShowCharacter from './actions/ShowCharacter.js';
import ShowCharacterLayer from './actions/ShowCharacterLayer.js';
import ShowImage from './actions/ShowImage.js';
import Stop from './actions/Stop.js';
import Vibrate from './actions/Vibrate.js';
import Video from './actions/Video.js';
import Wait from './actions/Wait.js';

Monogatari._actions = [
	Canvas,
	Choice,
	Clear,
	Conditional,
	End,
	Function,
	Gallery,
	HideCanvas,
	HideCharacter,
	HideCharacterLayer,
	HideImage,
	HideParticles,
	HideVideo,
	InputModal,
	Jump,
	Message,
	Next,
	Notify,
	Particles,
	Pause,
	Play,
	Placeholder,
	Scene,
	ShowBackground,
	ShowCharacter,
	ShowCharacterLayer,
	ShowImage,
	Stop,
	Vibrate,
	Video,
	Wait,

	// Dialog must always go last
	Dialog,
];

/**
 * Export Monogatari Core
 */
export * from './lib/Action';
export * from './lib/Component';
export * from './lib/ShadowComponent';
export * from './lib/ScreenComponent';
export * from './lib/MenuComponent';
export * from './lib/FancyError';

export default Monogatari;
