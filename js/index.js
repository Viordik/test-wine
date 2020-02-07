window.addEventListener('load', function () {
  const input = document.querySelector('.input');
  const btnCopy = document.querySelector('.btn--copy');
  const message = document.querySelector('.message');
  const btnModal = document.querySelector('.btn--modal');
  const btnChange = document.querySelector('.btn--change');
  const modal = document.querySelector('.modal');
  const textModal = document.querySelector('.modal__text');

  let url = new URL('http://localhost/?a=1&b=2&test=Y&clear=allcache');

  btnCopy.addEventListener('click', function () {
    if (input.value === '') {
      message.classList.add('message--error');
      setMessage(message, 'Зачем вам копировать пустоту!');
      clearMessage(message, 1500);
    } else {
      message.classList.add('message--good');
      input.select();
      document.execCommand('copy');
      setMessage(message, 'Текст скопирован');
      clearMessage(message, 1000);
    }
  });

  btnModal.addEventListener('click', function() {
    modal.classList.toggle('modal--active');
    textModal.innerHTML = url.search;

    console.log(url.search);
  });

  btnChange.addEventListener('click', function() {
    let newValueUrl = url;
    searchUrlParam(newValueUrl, 'a', '4');
    searchUrlParam(newValueUrl, 'clear', 'staticcashe');

    textModal.innerHTML = newValueUrl.search;

  });

  function searchUrlParam(urlNow, param, value) {
    if (urlNow.searchParams.has(param)) {
      urlNow.searchParams.set(param, value);
    }
  }



  function clearMessage(element,seconds) {
    setTimeout(function() {
      element.innerHTML = '';
    }, seconds);
  }

  function setMessage(element, message) {
    element.innerHTML = message;
  }
});
