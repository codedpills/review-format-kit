import type { ConventionGroup, ExtensionConfig } from './types';
import { CONFIG_VERSION } from './types';

/**
 * Default convention groups shipped with the extension
 */

export const CONVENTIONAL_COMMENTS_GROUP: ConventionGroup = {
    id: 'conventional-comments',
    name: 'Conventional Comments',
    description: 'Standard convention from conventionalcomments.org',
    isDefault: true,
    isBuiltIn: true,
    conventions: [
        {
            id: 'praise',
            label: 'praise',
            displayName: 'Praise',
            template: '**praise**: <subject>\n\n<optional discussion>',
            description: 'Highlight something positive',
            color: '#10B981',
        },
        {
            id: 'nitpick',
            label: 'nitpick',
            displayName: 'Nitpick',
            template: '**nitpick**: <subject>\n\n<optional discussion>',
            description: 'Minor issue, not blocking',
            color: '#F59E0B',
        },
        {
            id: 'suggestion',
            label: 'suggestion',
            displayName: 'Suggestion',
            template: '**suggestion**: <subject>\n\n<discussion>',
            description: 'Propose improvements or alternatives',
            color: '#3B82F6',
        },
        {
            id: 'issue',
            label: 'issue',
            displayName: 'Issue',
            template: '**issue**: <subject>\n\n<discussion>',
            description: 'Highlight a problem that needs to be addressed',
            color: '#EF4444',
        },
        {
            id: 'todo',
            label: 'todo',
            displayName: 'Todo',
            template: '**todo**: <subject>\n\n<optional discussion>',
            description: 'Follow-up work required',
            color: '#8B5CF6',
        },
        {
            id: 'question',
            label: 'question',
            displayName: 'Question',
            template: '**question**: <subject>\n\n<optional context>',
            description: 'Ask for clarification',
            color: '#06B6D4',
        },
        {
            id: 'thought',
            label: 'thought',
            displayName: 'Thought',
            template: '**thought**: <subject>\n\n<optional discussion>',
            description: 'Share an idea or perspective',
            color: '#EC4899',
        },
        {
            id: 'chore',
            label: 'chore',
            displayName: 'Chore',
            template: '**chore**: <subject>\n\n<optional discussion>',
            description: 'Routine tasks or maintenance',
            color: '#6B7280',
        },
        {
            id: 'note',
            label: 'note',
            displayName: 'Note',
            template: '**note**: <subject>\n\n<optional discussion>',
            description: 'General comment or observation',
            color: '#14B8A6',
        },
    ],
};

export const NETLIFY_FEEDBACK_LADDERS_GROUP: ConventionGroup = {
    id: 'netlify-feedback-ladders',
    name: 'Netlify Feedback Ladders',
    description: 'Feedback severity ladder from Netlify',
    isDefault: false,
    isBuiltIn: true,
    conventions: [
        {
            id: 'mountain',
            label: '[mountain]',
            displayName: '⛰ Mountain',
            template: '[mountain] ⛰ <feedback>\n\n<reasoning>',
            description: 'Blocking and requires immediate action',
            color: '#DC2626',
        },
        {
            id: 'boulder',
            label: '[boulder]',
            displayName: '🧗‍♀️ Boulder',
            template: '[boulder] 🧗‍♀️ <feedback>\n\n<reasoning>',
            description: 'Blocking but can wait for other tasks',
            color: '#EA580C',
        },
        {
            id: 'pebble',
            label: '[pebble]',
            displayName: '⚪️ Pebble',
            template: '[pebble] ⚪️ <feedback>\n\n<reasoning>',
            description: 'Non-blocking but requires future action',
            color: '#F59E0B',
        },
        {
            id: 'sand',
            label: '[sand]',
            displayName: '⏳ Sand',
            template: '[sand] ⏳ <feedback>\n\n<optional reasoning>',
            description: 'Non-blocking but requires future consideration',
            color: '#FBBF24',
        },
        {
            id: 'dust',
            label: '[dust]',
            displayName: '🌫 Dust',
            template: '[dust] 🌫 <feedback>',
            description: 'Non-blocking, take it or leave it',
            color: '#9CA3AF',
        },
    ],
};

/**
 * Get default extension configuration
 */
export function getDefaultConfig(): ExtensionConfig {
    return {
        version: CONFIG_VERSION,
        // Deep clone the groups to prevent mutation of shared constants
        groups: [
            JSON.parse(JSON.stringify(CONVENTIONAL_COMMENTS_GROUP)),
            JSON.parse(JSON.stringify(NETLIFY_FEEDBACK_LADDERS_GROUP)),
        ],
        settings: {
            keyboardShortcut: 'Ctrl+Shift+/',
            showInPageIcon: true,
            enabledDomains: ['github.com'],
            remoteConfigSyncInterval: 24, // 24 hours
        },
    };
}
