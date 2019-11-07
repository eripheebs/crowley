export const someHTML = `
  <html>
    <body>
      <div id="some stuff">
        <li class="main-navigation__links__item">
          <h3>
            <button class="main-navigation__links__link-toggle js-dropdown-toggle">
              Savings
              <svg class="main-navigation__links__link-toggle__icon">
                <use href="#down-chevron" xlink:href="#down-chevron"></use>
              </svg>
            </button>
          </h3>
          <ul class="main-navigation__links__dropdown js-dropdown">
            <li class="main-navigation__links__dropdown__item">
              <a href="/i/savingwithmonzo" class="main-navigation__links__link">Saving with Monzo</a>
            </li>
            <li class="main-navigation__links__dropdown__item">
              <a href="/features/savings" class="main-navigation__links__link">Interest Rates</a>
            </li>
            <li class="main-navigation__links__dropdown__item">
              <a href="/isa" class="main-navigation__links__link">Cash ISAs</a>
            </li>
            <li class="main-navigation__links__dropdown__item">
              <a href="/blog/2019/05/17/how-to-save-money" class="main-navigation__links__link--footer">
                <img src="/static/images/icons/extra-savings-icon.svg" alt="" class="main-navigation__links__link__icon">
                Our money saving guide
              </a>
            </li>
          </ul>
        </li>
      </div>
    </body>
  </html>
`;
