import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Page from './+page.svelte';

describe('홈 페이지', () => {
	it('제목과 Svelte 문서 링크를 보여준다', () => {
		render(Page);

		expect(screen.getByRole('heading', { name: 'Welcome to SvelteKit' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'svelte.dev/docs/kit' })).toHaveAttribute(
			'href',
			'https://svelte.dev/docs/kit'
		);
	});
});
