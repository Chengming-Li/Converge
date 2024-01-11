from flask import request, jsonify

CREATE_PROJECTS_TABLE = "CREATE TABLE IF NOT EXISTS projects (project_id SERIAL PRIMARY KEY, user_id INT, name TEXT, color TEXT, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);"
CREATE_PROJECT = "INSERT INTO projects (user_id, name, color) VALUES (%s, %s, %s) RETURNING project_id;"
DELETE_PROJECT = "UPDATE intervals SET project_id = NULL WHERE project_id = (%s); DELETE FROM projects WHERE project_id = (%s);"
EDIT_PROJECT = "UPDATE projects SET name = (%s), color = (%s) WHERE project_id = (%s);"
GET_ALL_PROJECTS_BY_USER = "SELECT * FROM projects WHERE user_id = %s ORDER BY name ASC;"

# region project functions
def createProject(establishConnection):
    """
    Create a new project and return its ID
    Json Body:
        "name" : (str) name of the project
        "user_id" : (str) ID of the user creating the interval

    @returns {json}: a dictionary containing the key "id"
    """
    connection = establishConnection()
    data = request.get_json()
    name = data["name"]
    color = data["color"]
    userID = int(data["user_id"])
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(CREATE_PROJECTS_TABLE)
                connection.commit()
                cursor.execute(CREATE_PROJECT, (userID, name, color))
                project_id = cursor.fetchone()[0]
    except Exception as e:
        return {"error": f"Failed to start the interval: {str(e)}"}, 500
    return jsonify({"id": str(project_id)}), 201

def getProjects(userId, establishConnection):
    """
    Fetch all projects made by user from database

    @param {int} userId: the ID of the user

    @returns {json}: a list of project objects
    """
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(GET_ALL_PROJECTS_BY_USER, (userId,))
                data = cursor.fetchall()
                projects = [{"project_id": str(project[0]), "user_id": str(project[1]), "name": project[2], "color": project[3]} for project in data]
    except Exception as e:
        return {"error": f"Failed to get user: {str(e)}"}, 500
    return jsonify(projects)

def deleteProject(project_id, establishConnection):
    """
    Delete project from database

    @param {int} project_id: the ID of the project

    @returns {json}: a dictionary containing the key "id"
    """
    connection = establishConnection()
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(DELETE_PROJECT, (project_id, project_id,))
                result = [{"id": str(project_id)}]
    except Exception as e:
        return {"error": f"Failed to delete interval: {str(e)}"}, 500
    return jsonify(result), 200

def editProject(project_id, establishConnection):
    """
    Edits project with project_id
    Json Body:
        "name" : (str)
        "color" : (str)
    
    @param {int} project_id: the ID of the project

    @returns {json}: a dictionary containing the keys "id", "name", and "color"
    """
    connection = establishConnection()
    data = request.get_json()
    name = data["name"]
    color = data["color"]
    try:
        with connection:
            with connection.cursor() as cursor:
                cursor.execute(EDIT_PROJECT, (name, color, project_id))
    except Exception as e:
        return {"error": f"Failed to edit interval: {str(e)}"}, 500
    return jsonify({"id": str(project_id), "name": name, "color": color}), 200
# endregion