const nlp = require('compromise');

// Extend compromise with additional plugins if needed
nlp.extend(require('compromise-dates'));

class NlpService {
    analyzeTaskText(text) {
        try {
            const doc = nlp(text);

            // Results object
            const analysis = {
                priority: this.detectPriority(doc, text),
                category: this.detectCategory(text),
                deadline: this.extractDeadline(doc),
                contactPerson: this.extractContactPerson(doc),
            };

            return analysis;
        } catch (error) {
            console.error('Error analyzing task text:', error);
            throw new Error('Failed to analyze task text');
        }
    }

    detectPriority(doc, text) {
        // Priority keywords
        const highPriorityTerms = ['urgent', 'important', 'asap', 'critical', 'high priority', 'highest priority'];
        const mediumPriorityTerms = ['moderate', 'medium priority', 'normal'];
        const lowPriorityTerms = ['low priority', 'whenever', 'no rush', 'eventually'];

        // Check for explicit priority keywords
        for (const term of highPriorityTerms) {
            if (text.toLowerCase().includes(term)) return 'High';
        }

        for (const term of mediumPriorityTerms) {
            if (text.toLowerCase().includes(term)) return 'Medium';
        }

        for (const term of lowPriorityTerms) {
            if (text.toLowerCase().includes(term)) return 'Low';
        }

        // Fallback: Check for urgency indicators like exclamation marks
        if (text.includes('!')) {
            return 'High';
        }

        // Check for deadline proximity as a factor
        const deadlineInfo = this.extractDeadline(doc);
        if (deadlineInfo.hasDeadline) {
            const daysUntilDeadline = this.calculateDaysUntilDeadline(deadlineInfo.date);
            if (daysUntilDeadline <= 1) return 'High';
            if (daysUntilDeadline <= 3) return 'Medium';
        }

        // Default priority
        return 'Medium';
    }

    detectCategory(text) {
        const lowerText = text.toLowerCase();

        // Category detection logic
        if (lowerText.includes('meeting') || lowerText.includes('call') ||
            lowerText.includes('conference') || lowerText.includes('discuss')) {
            return 'Meeting';
        }

        if (lowerText.includes('report') || lowerText.includes('document') ||
            lowerText.includes('write') || lowerText.includes('draft')) {
            return 'Work';
        }

        if (lowerText.includes('gym') || lowerText.includes('exercise') ||
            lowerText.includes('doctor') || lowerText.includes('appointment')) {
            return 'Personal';
        }

        if (lowerText.includes('buy') || lowerText.includes('shop') ||
            lowerText.includes('purchase')) {
            return 'Shopping';
        }

        if (lowerText.includes('study') || lowerText.includes('learn') ||
            lowerText.includes('read') || lowerText.includes('research')) {
            return 'Education';
        }

        if (lowerText.includes('travel') || lowerText.includes('trip') ||
            lowerText.includes('flight') || lowerText.includes('hotel')) {
            return 'Travel';
        }

        return 'General'; // Default category
    }

    extractDeadline(doc) {
        const dates = doc.dates().json();
        const result = { hasDeadline: false, date: null, text: null };

        if (dates.length > 0) {
            // Get the first date mentioned
            const foundDate = dates[0];

            // Check if date has a specific time
            const hasTime = foundDate.text.includes(':') ||
                doc.match('(at|by) #Cardinal (am|pm|AM|PM)').found;

            // Parse the date using native Date object
            try {
                const dateString = foundDate.start || foundDate.date;
                if (dateString) {
                    const date = new Date(dateString);
                    if (!isNaN(date.getTime())) {
                        result.hasDeadline = true;
                        result.date = date;
                        result.text = foundDate.text;
                    }
                }
            } catch (e) {
                console.error('Failed to parse date:', e);
            }
        }

        // Check for deadline-related terms
        const deadlineTerms = doc.match('(due|deadline|by|before) (today|tomorrow|#Date)');
        if (deadlineTerms.found && !result.hasDeadline) {
            // Handle "tomorrow", "today", etc.
            const term = deadlineTerms.text().toLowerCase();
            const now = new Date();

            if (term.includes('today')) {
                result.hasDeadline = true;
                result.date = new Date();
                result.text = 'today';
            } else if (term.includes('tomorrow')) {
                const tomorrow = new Date();
                tomorrow.setDate(now.getDate() + 1);
                result.hasDeadline = true;
                result.date = tomorrow;
                result.text = 'tomorrow';
            } else if (term.includes('next week')) {
                const nextWeek = new Date();
                nextWeek.setDate(now.getDate() + 7);
                result.hasDeadline = true;
                result.date = nextWeek;
                result.text = 'next week';
            }
        }

        return result;
    }

    extractContactPerson(doc) {
        // Look for names preceded by indicators
        const contactMatches = doc.match('(call|email|contact|meet|with|remind) [#Acronym? #ProperNoun+]');

        if (contactMatches.found) {
            // Extract just the name part
            const nameText = contactMatches.text().replace(/(call|email|contact|meet|with|remind)/i, '').trim();
            if (nameText) return nameText;
        }

        // Look for any proper nouns that might be names
        const properNouns = doc.match('#ProperNoun+').not('#Place').not('#Organization');
        if (properNouns.found) {
            return properNouns.text();
        }

        // Fallback: Look for names in common patterns
        const namePatterns = doc.match('(Mr|Ms|Mrs|Dr) #ProperNoun+');
        if (namePatterns.found) {
            return namePatterns.text();
        }

        return null;
    }

    calculateDaysUntilDeadline(date) {
        if (!date) return null;

        const now = new Date();
        const diffTime = Math.abs(date - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }
}

module.exports = new NlpService();