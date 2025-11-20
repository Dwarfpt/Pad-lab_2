import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

describe('App', () => {
    it('renders without crashing', () => {
        render(
            <BrowserRouter>
                <App />
            </BrowserRouter>
        );
        // Adjust this expectation based on what's actually in App.tsx
        // For now, we just check if it renders
        expect(document.body).toBeDefined();
    });
});
