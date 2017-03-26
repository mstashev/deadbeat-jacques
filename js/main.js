$(document).ready(function(){
  api_root = "https://deadbeat-jacques.herokuapp.com/api/"

  // Utility Methods

  function set_token(api_token) {
    localStorage.setItem('api_token', api_token);
  }

  function get_token() {
    return localStorage.getItem('api_token')
  }

  function log_out(){
    localStorage.removeItem('api_token')
  }

  function signed_in() {
    if(localStorage.getItem('api_token') === null) {
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

 function reset_form(form_id) {
    $(form_id)[0].reset()
  }

  function print_notes(tags) {
    var tag_list = ''
    tags.forEach(function(tag){
      if (tags.indexOf(tag) != (tags.length - 1)) {
        tag_list += `<a href="${tag.name}" class="tag_href">${tag.name}</a>,&nbsp;`
      }
      else {
        tag_list += `<a href="${tag.name}" class="tag_href">${tag.name}</a>`
      }
    })
    return tag_list
  }

  function note_display(note) {
    return  `
              <div class="media" id="note-${note.id}">
                <div class="media-body">
                  <h4>${note.title}</h4>
                  <p>${note.body}</p>
                  <p><i class="glyphicon glyphicon-tags"></i>&nbsp;&nbsp;${print_notes(note.tags)}</p>
                  <p><small>Posted by ${note.user.username} <a href="#note-${note.id}" class="note">${moment(note.created_at).fromNow()}</a></small></p>
                </div>
              </div>
            `
  }

  function notes_url() {
    if(signed_in()){
      return api_root + "notes?api_token=" + get_token()
    } else {
      return api_root + "notes"
    }
  }

  function tags_url(tag_name) {
    if(signed_in()){
      return api_root + "notes/tag/" + tag_name + "?api_token=" + get_token()
    } else {
      return api_root + "notes/tag/" + tag_name
    }
  }

  function populate_notes() {
    $('#note_list').empty()
    $.getJSON(notes_url())
      .done(function(response){
        response.notes.forEach(function(note){
          $('#note_list').append(
            note_display(note)
          )
        })
      })
    }

    function populate_tagged_notes(tag) {
      $('#note_list').empty()
      $.getJSON(tags_url(tag))
        .done(function(response){
          response.tag.notes.forEach(function(note){
            $('#note_list').append(
              note_display(note)
            )
          })
        })
      }

    $(document).on('click', '.tag_href', function(ev){
      ev.preventDefault()
      var tag = $(ev.target).attr('href')
      $.post(tags_url(tag), $(this).serialize())
        .done(function(response){
        toggle_sign_in()
        populate_tagged_notes()
      })
    })

    $('#sign_up').on('submit', function(ev){
      ev.preventDefault()
      $.post(api_root + "create", $(this).serialize())
        .done(function(response){
          set_token(response.api_token)
          toggle_sign_in()
          populate_notes()
        })
    })

    $('#post_note').on('submit', function(ev){
      ev.preventDefault()
      $.post(api_root + "notes/create?api_token=" + get_token(), $(this).serialize())
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
          set_token(response.api_token)
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
          // console.log(response.notes)
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
