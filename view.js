// ---- Define your dialogs  and panels here ----

//DISPLAY TEXT
lower = generate_lower_panel;
$('#lowerpanel').append(generate_lower_panel);

//CREATE THE INFO PANEL 
var info_panel = define_new_effective_permissions('effective_permissions', true);
$('#sidepanel').append(info_panel);

var user_dialog = define_new_user_select_field('user_select', 'Choose User', function(selected_user){
    $('#effective_permissions').attr('username', selected_user);
});

var file_dialog = define_new_file_select_field('file_select', 'Choose Folder/File', function(selected_file){
    $('#effective_permissions').attr('filepath', selected_file);
});

$('#sidepanel').append(user_dialog);
$('#sidepanel').append(file_dialog);

let new_dialog = define_new_dialog('new-dialog', title='', options = {});

$('.fa-info-circle').click(function(){

    filepath = $('#effective_permissions').attr('filepath');
    username = $('#effective_permissions').attr('username');
    permission = $(this).attr('permission_name');

    console.log("PERMISSION: " + permission);

    console.log("FILEPATH: " + filepath);
    console.log("USER: " + username);

    my_file_obj_var = path_to_file[filepath];
    my_user_obj_var = all_users[username];

    // get_permission_text(permission);

    if(filepath == undefined || username == undefined){
        full_text = get_permissions_text(permission)
        explanation = '<p><b>';
        if(filepath == undefined){
            explanation += 'Please choose a file.</br>'
        }
        if(username == undefined){
            explanation += 'Please choose a user.'
        }
        explanation += '</b></p>'
        new_dialog.html(full_text + explanation);
    }
    else {
        full_text = get_permissions_text(permission)
        explanation = get_explanation_text(allow_user_action(my_file_obj_var, my_user_obj_var, permission, explain_why = true))
        new_dialog.html(full_text + explanation);
    }

    new_dialog.dialog('open');

});


// ---- Display file structure ----

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 