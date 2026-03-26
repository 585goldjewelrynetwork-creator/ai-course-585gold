(function () {
    'use strict';

    var coursesData = [];
    var articlesData = [];
    var activeFilter = 'all';
    var searchQuery = '';

    document.addEventListener('DOMContentLoaded', init);

    function init() {
        loadCourses();
        loadArticles();
        setupSearch();
        setupFilters();
    }

    function loadCourses() {
        fetch('courses.json')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                coursesData = data;
                renderCourses(data);
                updateCoursesCount(data.length);
            })
            .catch(function () {
                coursesData = getDefaultCourses();
                renderCourses(coursesData);
                updateCoursesCount(coursesData.length);
            });
    }

    function loadArticles() {
        fetch('articles.json')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                articlesData = data;
                renderArticles(data);
                updateArticlesCount(data.length);
            })
            .catch(function () {
                articlesData = [];
                renderArticles([]);
                updateArticlesCount(0);
            });
    }

    function renderCourses(courses) {
        var grid = document.getElementById('coursesGrid');
        var empty = document.getElementById('coursesEmpty');

        if (!courses.length) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');
        var html = '';

        for (var i = 0; i < courses.length; i++) {
            var c = courses[i];
            var progress = Math.round((c.id / 6) * 100);

            html += '<div class="course-card" data-category="' + esc(c.category) + '" data-title="' + esc(c.title) + '" data-desc="' + esc(c.description) + '" style="animation-delay:' + (i * 0.05) + 's">';
            html += '  <div class="card-header">';
            html += '    <div class="card-emoji">' + c.emoji + '</div>';
            html += '    <div>';
            html += '      <span class="card-block-label">' + esc(c.block) + '</span>';
            html += '      <h3 class="card-title">' + esc(c.title) + '</h3>';
            html += '    </div>';
            html += '  </div>';
            html += '  <div class="card-body">';
            html += '    <p class="card-description">' + esc(c.description) + '</p>';
            html += '    <span class="card-category">' + esc(c.category) + '</span>';
            html += '  </div>';
            html += '  <div class="progress-track">';
            html += '    <div class="progress-bar-bg">';
            html += '      <div class="progress-bar-fill" style="width:' + progress + '%"></div>';
            html += '    </div>';
            html += '  </div>';
            html += '  <div class="card-footer">';
            html += '    <a href="' + esc(c.link) + '" target="_blank" rel="noopener noreferrer" class="btn-primary">Начать обучение</a>';
            html += '  </div>';
            html += '</div>';
        }

        grid.innerHTML = html;
    }

    function renderArticles(articles) {
        var grid = document.getElementById('articlesGrid');
        var empty = document.getElementById('articlesEmpty');

        if (!articles.length) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            return;
        }

        empty.classList.add('hidden');
        var html = '';

        for (var i = 0; i < articles.length; i++) {
            var a = articles[i];
            var date = formatDate(a.date);

            html += '<a href="' + esc(a.file) + '" class="article-card" data-title="' + esc(a.title) + '" data-desc="' + esc(a.description) + '" style="animation-delay:' + (i * 0.1) + 's">';
            html += '  <div class="article-card-meta">';
            html += '    <span class="article-card-tag">' + esc(a.tag) + '</span>';
            html += '    <span class="article-card-date">' + date + '</span>';
            html += '  </div>';
            html += '  <h3 class="article-card-title">' + esc(a.title) + '</h3>';
            html += '  <p class="article-card-desc">' + esc(a.description) + '</p>';
            html += '</a>';
        }

        grid.innerHTML = html;
    }

    function setupSearch() {
        var input = document.getElementById('searchInput');
        var timer;

        input.addEventListener('input', function () {
            clearTimeout(timer);
            timer = setTimeout(function () {
                searchQuery = input.value.trim().toLowerCase();
                applyFilters();
            }, 200);
        });
    }

    function setupFilters() {
        var container = document.getElementById('filterButtons');

        container.addEventListener('click', function (e) {
            var btn = e.target.closest('.filter-btn');
            if (!btn) return;

            var buttons = container.querySelectorAll('.filter-btn');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].classList.remove('active');
            }
            btn.classList.add('active');

            activeFilter = btn.getAttribute('data-filter');
            applyFilters();
        });
    }

    function applyFilters() {
        var courseCards = document.querySelectorAll('.course-card');
        var visibleCourses = 0;

        for (var i = 0; i < courseCards.length; i++) {
            var card = courseCards[i];
            var category = card.getAttribute('data-category');
            var title = (card.getAttribute('data-title') || '').toLowerCase();
            var desc = (card.getAttribute('data-desc') || '').toLowerCase();

            var matchFilter = activeFilter === 'all' || category === activeFilter;
            var matchSearch = !searchQuery || title.indexOf(searchQuery) !== -1 || desc.indexOf(searchQuery) !== -1;

            if (matchFilter && matchSearch) {
                card.style.display = '';
                visibleCourses++;
            } else {
                card.style.display = 'none';
            }
        }

        var coursesEmpty = document.getElementById('coursesEmpty');
        if (visibleCourses === 0) {
            coursesEmpty.classList.remove('hidden');
        } else {
            coursesEmpty.classList.add('hidden');
        }

        var articleCards = document.querySelectorAll('.article-card');
        var visibleArticles = 0;

        for (var j = 0; j < articleCards.length; j++) {
            var aCard = articleCards[j];
            var aTitle = (aCard.getAttribute('data-title') || '').toLowerCase();
            var aDesc = (aCard.getAttribute('data-desc') || '').toLowerCase();

            var aMatch = !searchQuery || aTitle.indexOf(searchQuery) !== -1 || aDesc.indexOf(searchQuery) !== -1;

            if (aMatch) {
                aCard.style.display = '';
                visibleArticles++;
            } else {
                aCard.style.display = 'none';
            }
        }

        var articlesEmpty = document.getElementById('articlesEmpty');
        if (visibleArticles === 0) {
            articlesEmpty.classList.remove('hidden');
        } else {
            articlesEmpty.classList.add('hidden');
        }
    }

    function esc(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        var months = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
        var parts = dateStr.split('-');
        return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1] + ' ' + parts[0];
    }

    function updateCoursesCount(count) {
        var el = document.getElementById('coursesCount');
        if (el) el.textContent = count + ' ' + declension(count, 'блок', 'блока', 'блоков');
    }

    function updateArticlesCount(count) {
        var el = document.getElementById('articlesCount');
        if (el) el.textContent = count + ' ' + declension(count, 'статья', 'статьи', 'статей');
    }

    function declension(n, one, two, five) {
        var abs = Math.abs(n) % 100;
        var n1 = abs % 10;
        if (abs > 10 && abs < 20) return five;
        if (n1 > 1 && n1 < 5) return two;
        if (n1 === 1) return one;
        return five;
    }

    function getDefaultCourses() {
        return [
            { id:1, title:"Написание промптов: основа работы с ИИ", block:"Блок 1", emoji:"✍️", description:"Всё начинается с промпта — вашего запроса или инструкции для ИИ.", link:"https://new-acc-space-6754.ispring.ru/app/preview/eb3c9e2d-0343-11f1-afeb-3292ce742d0c", category:"Основы" },
            { id:2, title:"Возможности современных ИИ-систем в работе с текстом", block:"Блок 2", emoji:"📝", description:"Узнайте, как с помощью ИИ составлять деловые письма и улучшать тексты.", link:"https://new-acc-space-6754.ispring.ru/app/preview/abb24110-0732-11f1-8c42-9a5c27d099db", category:"Текст" },
            { id:3, title:"Анализ данных с помощью ИИ + визуализация", block:"Блок 3", emoji:"📊", description:"Анализируйте данные быстрее, находите закономерности, стройте прогнозы.", link:"https://new-acc-space-6754.ispring.ru/app/preview/faeb883a-0ca3-11f1-b4ff-c2aff0ebdc4f", category:"Аналитика" },
            { id:4, title:"Визуальный контент: от слайдов до видео (Часть 1)", block:"Блок 4", emoji:"🎨", description:"Прокачайте визуал! Научимся работать с презентациями.", link:"https://new-acc-space-6754.ispring.ru/app/preview/659bcf99-1245-11f1-90a9-c2e14774ea64", category:"Визуал" },
            { id:5, title:"Визуальный контент: иллюстрации и видео (Часть 2)", block:"Блок 5", emoji:"🎬", description:"Создание изображений, редактирование фото, создание коротких видео.", link:"https://new-acc-space-6754.ispring.ru/app/preview/77d45172-1947-11f1-a7d7-eef858ee11f2", category:"Визуал" },
            { id:6, title:"Продвинутый промптинг: сложные запросы", block:"Блок 6", emoji:"🎯", description:"Сложные цепочки запросов, управление контекстом, промптинг для комплексных задач.", link:"https://new-acc-space-6754.ispring.ru/app/preview/7188dc1f-1e22-11f1-9ee9-5e011133f086", category:"Продвинутый" }
        ];
    }

})();