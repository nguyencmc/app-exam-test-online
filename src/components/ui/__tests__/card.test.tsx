// Component Tests for Card UI Component

import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Component', () => {
    it('renders card with all parts', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Test Title</CardTitle>
                    <CardDescription>Test Description</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Card content here</p>
                </CardContent>
                <CardFooter>
                    <button>Action</button>
                </CardFooter>
            </Card>
        );

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
        expect(screen.getByText('Card content here')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });

    it('renders card with custom className', () => {
        const { container } = render(
            <Card className="custom-class">Content</Card>
        );

        expect(container.firstChild).toHaveClass('custom-class');
    });

    it('renders CardTitle as h3', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Heading</CardTitle>
                </CardHeader>
            </Card>
        );

        expect(screen.getByRole('heading', { level: 3, name: /heading/i })).toBeInTheDocument();
    });
});
