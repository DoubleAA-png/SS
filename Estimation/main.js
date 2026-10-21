document.addEventListener('DOMContentLoaded', () => {
    // Interactive Button Actions
    const getStartedBtn = document.getElementById('getStartedBtn');
    const joinBtn = document.getElementById('joinBtn');
    const exploreBtn = document.getElementById('exploreBtn');
    const featureExploreBtns = document.querySelectorAll('.card-explore');
    const homeLink = document.querySelector('.logo');
    const heroSection = document.querySelector('.hero-section');
    const blankPage = document.getElementById('blankPage');
    const aboutContent = document.getElementById('aboutContent');
    const notesContent = document.getElementById('notesContent');
    const footer = document.querySelector('.footer');
    const pageLinks = document.querySelectorAll('.nav-link');
    const addLinkBtn = document.getElementById('addLinkBtn');
    const linkDialog = document.getElementById('linkDialog');
    const linkDialogInput = document.getElementById('linkDialogInput');
    const linkForm = document.getElementById('linkForm');
    const videoUrl = document.getElementById('videoUrl');
    const addFileBtn = document.getElementById('addFileBtn');
    const fileInput = document.getElementById('fileInput');
    const fileButtonLabel = document.getElementById('fileButtonLabel');
    const notesInput = document.getElementById('notesInput');
    const organizeNotesBtn = document.getElementById('organizeNotesBtn');
    const notesSummaryOutput = document.getElementById('notesSummaryOutput');
    const geminiStatus = document.getElementById('geminiStatus');
    const validPages = new Set(['homework', 'notes', 'quizzes', 'about']);

    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#/home`);

    const showCurrentPage = () => {
        const page = window.location.hash.startsWith('#/')
            ? window.location.hash.slice(2)
            : 'home';
        const isHome = page === 'home' || !validPages.has(page);

        heroSection.hidden = !isHome;
        blankPage.hidden = isHome;
        blankPage.classList.toggle('about-page', page === 'about');
        blankPage.classList.toggle('notes-page', page === 'notes');
        aboutContent.hidden = page !== 'about';
        notesContent.hidden = page !== 'notes';
        footer.hidden = !isHome;

        pageLinks.forEach((link) => {
            const isCurrentPage = link.getAttribute('href') === `#/${page}`;
            link.classList.toggle('is-active', isCurrentPage);
            if (isCurrentPage) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    window.addEventListener('hashchange', showCurrentPage);
    showCurrentPage();

    fetch('/api/status')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Could not check Gemini service status.');
            }
            return response.json();
        })
        .then((status) => {
            geminiStatus.textContent = status.geminiConnected ? 'Gemini ready' : 'AI not configured';
        })
        .catch(() => {
            geminiStatus.textContent = 'AI status unavailable';
        });

    const joinStudyHub = () => {
        alert('Welcome! Let’s set up your first study goal or note.');
    };

    getStartedBtn.addEventListener('click', joinStudyHub);
    joinBtn.addEventListener('click', joinStudyHub);
    homeLink.addEventListener('click', () => {
        if (window.location.hash === '#/home') {
            showCurrentPage();
        }
    });

    featureExploreBtns.forEach((button) => {
        button.addEventListener('click', () => {
            const feature = button.dataset.feature;
            window.location.hash = `/${feature}`;
        });
    });

    exploreBtn.addEventListener('click', () => {
        document.getElementById('features').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });

    addLinkBtn.addEventListener('click', () => {
        linkDialog.showModal();
        linkDialogInput.focus();
    });

    document.getElementById('closeLinkDialog').addEventListener('click', () => {
        linkDialog.close();
    });

    document.getElementById('cancelLinkDialog').addEventListener('click', () => {
        linkDialog.close();
    });

    linkDialog.addEventListener('click', (event) => {
        if (event.target === linkDialog) {
            linkDialog.close();
        }
    });

    linkForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!linkForm.reportValidity()) {
            return;
        }

        videoUrl.value = linkDialogInput.value.trim();
        linkDialog.close();
        linkDialogInput.value = '';
        videoUrl.focus();
    });

    addFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        const [file] = fileInput.files;
        if (file) {
            fileButtonLabel.textContent = file.name;
            addFileBtn.title = file.name;
            addFileBtn.setAttribute('aria-label', `Change selected file: ${file.name}`);

            const supportedFile = /\.(txt|md|csv|json|html?)$/i.test(file.name)
                || file.type.startsWith('text/');
            if (!supportedFile) {
                showNotesMessage('This file type is not supported yet', 'Choose a text file such as .txt, .md, .csv, .json, or .html.');
                return;
            }

            file.text().then((text) => {
                notesInput.value = text;
                showNotesMessage('File ready to organize', `${file.name} · ${countWords(text)} words`);
            }).catch(() => {
                showNotesMessage('Could not read this file', 'Try another text file, or paste your notes directly.');
            });
        }
    });

    const countWords = (text) => (text.trim().match(/\b[\w'-]+\b/g) || []).length;

    const showNotesMessage = (title, message) => {
        notesSummaryOutput.classList.remove('has-summary');
        notesSummaryOutput.replaceChildren();

        const heading = document.createElement('h3');
        heading.textContent = title;
        const description = document.createElement('p');
        description.textContent = message;
        notesSummaryOutput.append(heading, description);
    };

    const showOrganizedNotes = (notesMarkdown, sourceText) => {
        notesSummaryOutput.replaceChildren();
        notesSummaryOutput.classList.add('has-summary');

        const header = document.createElement('div');
        header.className = 'summary-result-header';
        const eyebrow = document.createElement('span');
        eyebrow.textContent = 'ORGANIZED STUDY NOTES';
        const privacyLabel = document.createElement('span');
        privacyLabel.className = 'summary-count';
        privacyLabel.textContent = 'Gemini';
        header.append(eyebrow, privacyLabel);

        const heading = document.createElement('h3');
        heading.textContent = 'Study notes';
        const summaryText = document.createElement('div');
        summaryText.className = 'summary-generated-text';
        let list;
        notesMarkdown.split(/\r?\n/).forEach((line) => {
            const trimmedLine = line.trim();
            if (!trimmedLine) {
                list = null;
                return;
            }

            const headingMatch = trimmedLine.match(/^(#{1,4})\s+(.+)$/);
            if (headingMatch) {
                list = null;
                const headingLevel = Math.min(6, 3 + headingMatch[1].length);
                const sectionHeading = document.createElement(`h${headingLevel}`);
                sectionHeading.textContent = headingMatch[2];
                summaryText.append(sectionHeading);
                return;
            }

            const boldHeadingMatch = trimmedLine.match(/^\*\*(.+)\*\*$/);
            if (boldHeadingMatch) {
                list = null;
                const sectionHeading = document.createElement('h4');
                sectionHeading.textContent = boldHeadingMatch[1];
                summaryText.append(sectionHeading);
                return;
            }

            const bulletMatch = trimmedLine.match(/^(?:[-*•]|\d+[.)])\s+(.+)$/);
            if (bulletMatch) {
                if (!list) {
                    list = document.createElement('ul');
                    summaryText.append(list);
                }
                const item = document.createElement('li');
                item.textContent = bulletMatch[1].replace(/\*\*(.+?)\*\*/g, '$1');
                list.append(item);
                return;
            }

            list = null;
            const paragraph = document.createElement('p');
            paragraph.textContent = trimmedLine.replace(/\*\*(.+?)\*\*/g, '$1');
            summaryText.append(paragraph);
        });

        const meta = document.createElement('p');
        meta.className = 'summary-meta';
        meta.textContent = `${countWords(sourceText)} source words · ${countWords(notesMarkdown)} organized words`;
        notesSummaryOutput.append(header, heading, summaryText, meta);
    };

    organizeNotesBtn.addEventListener('click', async () => {
        const text = notesInput.value.trim();
        if (!text) {
            showNotesMessage('Add something to organize', 'Paste your notes above or choose a text file to get started.');
            notesInput.focus();
            return;
        }

        organizeNotesBtn.disabled = true;
        organizeNotesBtn.setAttribute('aria-busy', 'true');
        organizeNotesBtn.textContent = 'Organizing…';
        showNotesMessage('Organizing your notes', 'Gemini will group related ideas and explain how they connect.');

        try {
            const response = await fetch('/api/organize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Gemini could not organize these notes.');
            }

            if (typeof result.notes !== 'string' || !result.notes.trim() || result.notes.trim().toLowerCase() === text.toLowerCase()) {
                throw new Error('Gemini did not return organized notes. Your source text is unchanged.');
            }
            showOrganizedNotes(result.notes, text);
        } catch (error) {
            showNotesMessage('Could not organize notes', error.message || 'Check the server and Gemini API key, then try again. Your source text is unchanged.');
        } finally {
            organizeNotesBtn.disabled = false;
            organizeNotesBtn.removeAttribute('aria-busy');
            organizeNotesBtn.textContent = 'Organize notes';
        }
    });
});