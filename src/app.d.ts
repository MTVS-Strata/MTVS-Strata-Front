// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	type UnityInstance = {
		SetFullscreen: (fullscreen: 0 | 1) => void;
		Quit: () => Promise<void>;
	};

	type UnityConfig = {
		arguments: string[];
		dataUrl: string;
		frameworkUrl: string;
		codeUrl: string;
		streamingAssetsUrl: string;
		companyName: string;
		productName: string;
		productVersion: string;
		showBanner: (message: string, type: 'error' | 'warning') => void;
	};

	interface Window {
		createUnityInstance?: (
			canvas: HTMLCanvasElement,
			config: UnityConfig,
			onProgress: (progress: number) => void
		) => Promise<UnityInstance>;
	}

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
