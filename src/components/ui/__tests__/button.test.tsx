// Component Tests for UI Components

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
    it('renders button with text', () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);

        screen.getByRole('button').click();
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies variant classes', () => {
        render(<Button variant="destructive">Delete</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-destructive');
    });

    it('applies size classes', () => {
        render(<Button size="lg">Large Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('h-12'); // lg size uses h-12
    });

    it('can be disabled', () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('renders as child element when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        );
        expect(screen.getByRole('link', { name: /link button/i })).toBeInTheDocument();
    });
});
