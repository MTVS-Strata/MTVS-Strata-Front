<script lang="ts">
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let progress = $state(0);
	let loading = $state(true);
	let errorMessage = $state('');
	let warningMessage = $state('');
	let unityInstance = $state<UnityInstance | null>(null);

	const buildUrl = '/unity/Build';

	function loadScript(src: string) {
		return new Promise<void>((resolve, reject) => {
			const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
			if (existing && window.createUnityInstance) {
				resolve();
				return;
			}

			const script = existing ?? document.createElement('script');
			script.src = src;
			script.onload = () => resolve();
			script.onerror = () => reject(new Error('Unity 로더를 불러오지 못했습니다.'));

			if (!existing) document.body.appendChild(script);
		});
	}

	function showBanner(message: string, type: 'error' | 'warning') {
		if (type === 'error') {
			errorMessage = message;
			return;
		}

		warningMessage = message;
		window.setTimeout(() => {
			warningMessage = '';
		}, 5000);
	}

	onMount(() => {
		let disposed = false;

		async function startUnity() {
			try {
				await loadScript(`${buildUrl}/4a561a9f732daef2326d8743b13a7d99.loader.js`);

				if (!window.createUnityInstance) {
					throw new Error('Unity 초기화 함수를 찾을 수 없습니다.');
				}

				const instance = await window.createUnityInstance(
					canvas,
					{
						arguments: [],
						dataUrl: `${buildUrl}/1f099c344cd315af30ffc3f04dd0b3ed.data.unityweb`,
						frameworkUrl: `${buildUrl}/ab21016636a7e4b9f88cdc8797bb10bb.framework.js.unityweb`,
						codeUrl: `${buildUrl}/f28152507e51f8ef8b3ff9dadd75033d.wasm.unityweb`,
						streamingAssetsUrl: '/unity/StreamingAssets',
						companyName: 'DefaultCompany',
						productName: 'MTVS-strata-unity',
						productVersion: '0.1.0',
						cacheControl: () => 'no-store',
						showBanner
					},
					(value) => (progress = value)
				);

				if (disposed) {
					await instance.Quit();
					return;
				}

				unityInstance = instance;
				loading = false;
			} catch (error) {
				loading = false;
				errorMessage = error instanceof Error ? error.message : String(error);
			}
		}

		startUnity();

		return () => {
			disposed = true;
			const instance = unityInstance;
			unityInstance = null;
			if (instance) void instance.Quit();
		};
	});
</script>

<svelte:head>
	<title>MTVS Strata</title>
	<meta
		name="description"
		content="Play MTVS Strata in your browser"
	/>
</svelte:head>

<main class="game-page">
	<section class="game-shell" aria-label="MTVS Strata Unity WebGL player">
		<canvas bind:this={canvas} id="unity-canvas" tabindex="0"></canvas>

		{#if loading}
			<div class="loading" role="status" aria-live="polite">
				<div class="loading-title">MTVS Strata 불러오는 중</div>
				<div class="progress-track">
					<div class="progress-bar" style:width={`${Math.round(progress * 100)}%`}></div>
				</div>
				<div class="progress-label">{Math.round(progress * 100)}%</div>
			</div>
		{/if}

		{#if errorMessage}
			<div class="message error" role="alert">{errorMessage}</div>
		{:else if warningMessage}
			<div class="message warning" role="status">{warningMessage}</div>
		{/if}
	</section>

	<button
		class="fullscreen"
		type="button"
		disabled={!unityInstance}
		onclick={() => unityInstance?.SetFullscreen(1)}
	>
		전체 화면
	</button>
</main>

<style>
	:global(*) {
		box-sizing: border-box;
	}

	:global(html),
	:global(body) {
		margin: 0;
		min-height: 100%;
		background: #101114;
	}

	:global(body) {
		overflow: hidden;
		font-family: Arial, sans-serif;
	}

	.game-page {
		display: grid;
		min-height: 100dvh;
		place-items: center;
		padding: 24px;
		color: white;
	}

	.game-shell {
		position: relative;
		width: min(960px, calc(100vw - 48px));
		aspect-ratio: 8 / 5;
		overflow: hidden;
		background: #231f20;
		box-shadow: 0 20px 60px rgb(0 0 0 / 45%);
	}

	#unity-canvas {
		display: block;
		width: 100%;
		height: 100%;
		background: #231f20;
		outline: none;
	}

	.loading {
		position: absolute;
		inset: 0;
		display: grid;
		align-content: center;
		justify-items: center;
		gap: 12px;
		background: #231f20;
	}

	.loading-title {
		font-size: 18px;
		font-weight: 700;
	}

	.progress-track {
		width: min(320px, 70%);
		height: 10px;
		overflow: hidden;
		border-radius: 999px;
		background: #454146;
	}

	.progress-bar {
		height: 100%;
		border-radius: inherit;
		background: #f4f4f5;
		transition: width 120ms ease-out;
	}

	.progress-label {
		color: #b8b5b9;
		font-size: 13px;
	}

	.message {
		position: absolute;
		top: 16px;
		left: 50%;
		z-index: 2;
		width: min(640px, calc(100% - 32px));
		transform: translateX(-50%);
		border-radius: 8px;
		padding: 12px 16px;
		color: #171717;
		text-align: center;
	}

	.error {
		background: #fecaca;
	}

	.warning {
		background: #fef08a;
	}

	.fullscreen {
		position: fixed;
		right: 20px;
		bottom: 20px;
		border: 1px solid #555861;
		border-radius: 8px;
		padding: 10px 16px;
		background: #292b31;
		color: white;
		cursor: pointer;
	}

	.fullscreen:disabled {
		cursor: default;
		opacity: 0.45;
	}

	@media (max-width: 700px), (max-height: 600px) {
		.game-page {
			padding: 0;
		}

		.game-shell {
			width: 100vw;
			height: 100dvh;
			aspect-ratio: auto;
		}

		.fullscreen {
			display: none;
		}
	}
</style>
