$(document).ready(function(){
  api_root = "https://deadbeat-jacques.herokuapp.com/api/"

  // Utility Methods

  function set_token(api_token){
    localStorage.setItem('api_token', api_token);
  }

  function get_token(){
    return localStorage.getItem('api_token')
  }

  function log_out(){
    localStorage.removeItem('api_token')
  }

  function signed_in(){
    if(localStorage.getItem('api_token') === null) {
      return false
    }
    else{
      return true
    }
  }

  // toggles sign in/sign out buttons
  function toggle_sign_in(){
    if(signed_in()){
      $('.logged_out').hide()
      $('.logged_in').show()
    }
    else{
      $('.logged_in').hide()
      $('.logged_out').show()
    }
  }

  // resets form
  function reset_form(form_id){
    $(form_id)[0].reset()
  }

  // prints a tag for a note to a HTML partial
  function print_notes(tags){
    var tag_list = ''
    tags.forEach(function(tag){
      if (tags.indexOf(tag) != (tags.length - 1)){
        tag_list += `<a href="${tag.name}" class="tag_href">${tag.name}</a>,&nbsp;`
      }
      else{
        tag_list += `<a href="${tag.name}" class="tag_href">${tag.name}</a>`
      }
    })
    return tag_list
  }

  // renders a note in an HTML partial
  function note_display(note){
    var username = ''
    if (note.user == null){
      username = "Anonymous"
    }
    else{
      username = note.user.username
    }
    return  `
              <div class="media" id="note-${note.id}">
                <div class="media-body">
                  <h4>${note.title}</h4>
                  <p>${note.body}</p>
                  <p><i class="glyphicon glyphicon-tags"></i>&nbsp;&nbsp;${print_notes(note.tags)}</p>
                  <p><small>Posted by ${username} <a href="#note-${note.id}" class="note_show">${moment(note.created_at).fromNow()}</a></small></p>
                </div>
              </div>
            `
  }

  // sets the note route
  function notes_url(){
    if(signed_in()){
      return api_root + "notes?api_token=" + get_token()
    } else {
      return api_root + "notes"
    }
  }

  // sets the tag route
  function tags_url(tag_name){
    if(signed_in()){
      return api_root + "notes/tag/" + tag_name + "?api_token=" + get_token()
    }
    else{
      return api_root + "notes/tag/" + tag_name
    }
  }

  // populates all notes
  function populate_notes(){
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

  // populates all notes with given tag
  function populate_tagged_notes(tag){
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

  // makes a tag clickable,
  // then when clicked,
  // shows all notes with said tag
  $(document).on('click', '.tag_href', function(ev){
    ev.preventDefault()
    var tag = $(ev.target).attr('href')
    document.getElementById('tag_search_name').innerHTML = ": " + tag;
    $.get(tags_url(tag), $(this).serialize())
    .done(function(response){
      toggle_sign_in()
      populate_tagged_notes(tag)
    })
  })

  // when you create a user,
  // then create in the db
  $('#sign_up').on('submit', function(ev){
    ev.preventDefault()
    $.post(api_root + "users", $(this).serialize())
    .done(function(response){
      set_token(response.api_token)
      toggle_sign_in()
      populate_notes()
    })
  })

  // When you submit a new note,
  // then create in the db
  $('#post_note').on('submit', function(ev){
    ev.preventDefault()
    console.log(get_token())
    $.post(api_root + "notes?api_token=" + get_token(), $(this).serialize())
    .done(function(response){
      $('#note_list').prepend(
        note_display(response.note)
      )
      reset_form('#post_note')
    })
  })

  // sign out
  $('#sign_out').on('click', function(ev){
    ev.preventDefault()
    log_out()
    toggle_sign_in()
    populate_notes()
  })

  // sign in
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

  // when clicking on the date, display modal
  $(document).on('click', '.note_show', function(ev){
    id_to_fetch = $(ev.target).attr("href")
    console.log($(id_to_fetch).html())
    $('#modal_one .modal-body').html($(id_to_fetch).html())
    $('#modal_one').modal('show')
  })

  // on first load of the page
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
