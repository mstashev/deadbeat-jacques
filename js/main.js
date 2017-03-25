$(document).ready(function(){
  api_root = "https://deadbeat-jacques.herokuapp.com/api/"

  // Utility Methods

  function set_token(token) {
    localStorage.setItem('token', token);
  }

  function get_token() {
    return localStorage.getItem('token')
  }

  function log_out(){
    localStorage.removeItem('token')
  }

  function signed_in() {
    if(localStorage.getItem('token') === null) {
      return false
    } else {
      return true
    }
  }

  function toggle_sign_in(){
    if(signed_in()){
      $('.logged_out').hide()
      $('.logged_in').show()
    }else{
      $('.logged_in').hide()
      $('.logged_out').show()
    }
  }

 function reset_form(form_id){
    $(form_id)[0].reset()
  }

  function note_display(note) {
    return  `
              <div class="media" id="note-${note.id}">
                <div class="media-left">
                  <h5>${note.title}</h5>
                </div>
                <div class="media-body">
                  <p>${note.body}</p>
                  <p><small>Posted by ${note.user.username} <a href="#note-${note.id}" class="note">${moment(note.created_at).fromNow()}</a></small></p>
                </div>
              </div>
            `
  }

  function notes_url() {
    if(signed_in()){
      return api_root + "notes?token=" + get_token()
    } else {
      return api_root + "notes"
    }
  }

  function populate_notes() {
    $('#note_list').empty()
    $.getJSON(notes_url())
      .done(function(response){
        response.forEach(function(note){
          $('#note_list').append(
            note_display(note)
          )
        })
      })
    }

    $('#sign_up').on('submit', function(ev){
      ev.preventDefault()
      $.post(api_root + "create", $(this).serialize())
        .done(function(response){
          set_token(response.token)
          toggle_sign_in()
          populate_notes()
        })
    })

    $('#post_note').on('submit', function(ev){
      ev.preventDefault()
      $.post(api_root + "notes/create?token=" + get_token(), $(this).serialize())
        .done(function(note){
          $('#note_list').prepend(
            note_display(note)
          )
         reset_form('#post_note')
        })
    })

    $('#sign_out').on('click', function(ev){
      ev.preventDefault()
      log_out()
      toggle_sign_in()
      populate_notes()
    })

    $('#sign_in').on('submit', function(ev){
      ev.preventDefault()
      $.post(api_root + "login", $(this).serialize())
        .done(function(response){
          set_token(response.token)
          reset_form('#sign_in')
          toggle_sign_in()
          populate_notes()
        })
    })

    $(document).on('click', '.note_show', function(ev){
      // ev.preventDefault()
      id_to_fetch = $(ev.target).attr("href")
      console.log($(id_to_fetch).html())
      $('#modal_one .modal-body').html($(id_to_fetch).html())
      $('#modal_one').modal('show')
    })

    function first_load(){
      $('#note_list').empty()
      $.getJSON(notes_url())
        .done(function(response){
          response.notes.forEach(function(note){
            $('#note_list').append(
              note_display(note)
            )
          })
          if(window.location.hash){
            $('a[href="' + window.location.hash + '"]').click()
          }
        })
    }
  toggle_sign_in()
  first_load()
})
