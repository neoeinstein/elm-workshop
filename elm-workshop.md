# Elm Workshop with 0.17

: _You can find examples of a final state by looking at the
  [end-of-workshop](https://mcpstash.cimpress.net/projects/MSWLSC/repos/elm-workshop/browse?at=refs%2Fheads%2Fend-of-workshop) branch_

## Hello World

### Initial start

Prepare a basic program.

* Create a `Main.elm` in the `src` directory
* `main` is the entrypoint
* Elm program is composed of `Model`, `view`, and `update`

```elm
module Main exposing (..)

import Html.App as Html

model = { name = "Marcus" }

view model = text ("Hello, " ++ model.name ++ "!")

update msg model = model

main =
    Html.beginnerProgram
        { model = model
        , view = view
        , update = update
        }
```

### Add structure

Expand `view` to use a div that uses the bootstrap `container` class

```elm
import Html exposing (..)
import Html.Attributes exposing (..)

view model =
    div
        []
        [ div
            [ class "container" ]
            [ text ("Hello, " ++ model.name ++ "!") ]
        ]
```

## User Interaction

### Messages as user input

* Create a message that accepts a button click
* Add a button to `view` that triggers that message
* Add a counter into the model
* Update the update to increment the counter on each click
 * Note the syntax for "mutation"

```elm
import Html.Events exposing (..)

type Msg = Click

model =
    { name = "Marcus"
    , clicks = 0
    }

view model =
    div
        []
        [ div
            [ class "container" ]
            [ text ("Hello, " ++ model.name ++ "!")
            , button
                [ onClick Click ]
                [ text ("I've been clicked " ++ model.clicks ++ " times") ]
            ]
        ]

update msg model =
    case msg of
        Click ->
            { model | clicks = model.clicks + 1 }
```

### Digression: Signatures

* The signatures for `model`, `view`, `update`, and `main` are all inferred
* Define a `type alias` for the model
* Add some actual signatures

```elm
type alias Model =
    { name : String
    , clicks : Int
    }

model : Model

view : Model -> Html Msg

update : Msg -> Model -> Model

main : Program Never
```

### Digression: Error messages

* Modify `view` to use `model.world` instead of `model.name` and see the error message
* Add a case to `Msg`: `type Msg = Click | Clack`; see the error message about missing cases in `update`
* Modify `view` to call `txt` instead of `text`; see the error message

### Getting some text input

* Add a case to `Msg` that accepts a `String`
* Add a text input to `view` that sends a message when the text changes
* Add a case to `update` to handle the new case

```elm
type Msg
    = Click
    | UpdateHello String

view model =
    div
        []
        [ div
            [ class "container" ]
            [ text ("Hello, " ++ model.name ++ "!")
            , input
                [ type' "text"
                , placeholder "Who should I say hello to?"
                , value model.name
                , onInput UpdateHello
                ]
                []
            , button
                [ onClick Click ]
                [ text ("I've been clicked " ++ model.clicks ++ " times") ]
            ]
        ]

update msg model =
    case msg of
        Click ->
            { model | clicks = model.clicks + 1 }
        UpdateHello name ->
            { model | name = name }
```

* Modify the text box to send a message only when the input loses focus: `onBlur`

## Creating components

### Structuring components

* Create a `ValidationBox.elm` file in `src/Components`
* Components look a lot like our program, but without `main`

* Create Validation Box component

```elm
module Components.ValidateBox exposing (..)

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)

type Msg
    = UpdateText String

type Model
    = Model
        { id : String
        , text : String
        }


type alias InitialParams =
    { id : String
    , initialText : String
    }


init : InitialParams -> Model
init ps =
    Model
        { id = ps.id
        , text = ps.initialText
        }

update : Msg -> Model -> Model
update msg (Model model) =
    Model
        ( case msg of
            UpdateText newText ->
                { model
                | text = newText
                }
        )

view : Model -> Html Msg
view (Model model) =
        div
            [ class "form-group" ]
            [ input
                [ id model.id
                , type' "text"
                , value model.text
                , onInput UpdateText
                , class "form-control"
                ]
                []
            ]

```

### Hook into main view

```elm
import Components.ValidateBox as ValidateBox

type Msg
    | VBox1 ValidateBox.Msg
    | VBox2 ValidateBox.Msg

type alias Model =
    , vbox1 : ValidateBox.Model
    , vbox2 : ValidateBox.Model

initialModel =
    , vbox1 =
        ValidateBox.init
            { id = "vbox1"
            , initialText = ""
            }
    , vbox2 =
        ValidateBox.init
            { id = "vbox2"
            , initialText = "init"
            }

update msg model =
        VBox1 vboxMsg ->
            ( { model | vbox1 = ValidateBox.update vboxMsg model.vbox1 }, Cmd.none )
        VBox2 vboxMsg ->
            ( { model | vbox2 = ValidateBox.update vboxMsg model.vbox2 }, Cmd.none )

view model =
            , Html.map VBox1 (ValidateBox.view model.vbox1)
            , Html.map VBox2 (ValidateBox.view model.vbox2)
```


### Expand responsibilities

* Add label, placeholder, help text

```elm
type Model
    = Model
        , label : Maybe String
        , placeholder : Maybe String
        , helpText : Maybe String


type alias InitialParams =
    , label : Maybe String
    , placeholder : Maybe String
    , helpText : Maybe String

view (Model model) =
    let
        placeholderAttr =
            case model.placeholder of
                Just p -> [ placeholder p ]
                Nothing -> []
        inputAttr =
            [ id model.id
            , type' "text"
            , value model.text
            , onInput UpdateText
            , class "form-control"
            ]
        labelElement =
            case model.label of
                Just l -> [ label [ for model.id ] [ text l ] ]
                Nothing -> []
        helpBlockElement =
            case model.helpText of
                Just ht -> [ p [ class "help-block" ] [ text ht ] ]
                Nothing -> []
        inputElements =
            [ input (List.concat [inputAttr, placeholderAttr]) [] ]
    in
        div
            [ class "form-group" ]
            ( List.concat
                [ labelElement
                , inputElements
                , helpBlockElement
                ]
            )
```

* Allow reset

```elm
type Msg
    | Reset

type Model
    = Model
        , initialText : String

type alias InitialParams =
    , initialText : String


init ps =
            , initialText = ps.initialText

update msg model =
                Reset ->
                    { model
                    | text = model.initialText
                    , validationResult = model.initialText |> model.validate
                    }
```

* Add normalization

```elm
type Model
    = Model
        , normalize : String -> String

type alias InitialParams =
    , normalize : String -> String

init ps =
        normalizedInitialText = ps.initialText |> ps.normalize
            , initialText = normalizedInitialText
            , normalize = ps.normalize
            , text = normalizedInitialText

update msg model =
                UpdateText newText ->
                    let
                        normalizedText = newText |> model.normalize
                    in
                        { model
                        | text = normalizedText
                        }
```

* Add validation

```elm
type Model
    = Model
        , validate : String -> Result String ()
        , validationResult : Result String ()

type alias InitialParams =
    , validate : String -> Result String ()


init ps =
            , validate = ps.validate
            , validationResult = normalizedInitialText |> ps.validate


update msg model =
                UpdateText newText ->
                        , validationResult = normalizedText |> model.validate

view (Model model) =
    let
        isSuccess = model.validationResult |> Result.map (\() -> True) |> Result.toMaybe |> Maybe.withDefault False
        placeholderAttr =
            case model.placeholder of
                Just p -> [ placeholder p ]
                Nothing -> []
        inputAttr =
            [ id model.id
            , type' "text"
            , value model.text
            , onInput UpdateText
            , class "form-control"
            ]
        labelElement =
            case model.label of
                Just l -> [ label [ for model.id ] [ text l ] ]
                Nothing -> []
        helpBlockElement =
            case model.helpText of
                Just ht -> [ p [ class "help-block" ] [ text ht ] ]
                Nothing -> []
        inputElements =
            [ input (List.concat [inputAttr, placeholderAttr]) []
            , span [ classList [ ( "glyphicon", True ), ( "glyphicon-ok", isSuccess ), ( "glyphicon-remove", not isSuccess ), ("form-control-feedback", True ) ] ] []
            ]
    in
        div
            [ classList [ ( "form-group", True ), ( "has-success", isSuccess ), ( "has-error", not isSuccess ), ( "has-feedback", True ) ] ]
            ( List.concat
                [ labelElement
                , inputElements
                , helpBlockElement
                ]
            )
```

## Interacting with the world

### Subscriptions and commands

* Update `Main.elm` to use `Html.App.program` instead of `Html.App.beginnerProgram`

```elm
-- INIT
-- Add an init which pairs the initial model with Cmd.none

model : Model
model =
    { count = 0 }


init : ( Model, Cmd Msg )
init = ( model, Cmd.none )

-- UPDATE
-- Most now return tuple of a model and Cmd.none
-- for example:

update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Click ->
            ( { model | count = model.count + 1 }
            , Cmd.none
            )

-- VIEW
-- no change to the view

-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none


main : Program Never
main =
    Html.program
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }
```

### Hitting a healthcheck

* Add a case to `Msg` for a healthcheck message

```elm
import Api.Healthcheck as Healthcheck
import Time exposing (Time)

type Msg
    = Click
    | TriggerHealthCheck
    | Healthcheck (Result () Healthcheck.TestResult)


performHealthcheck : Cmd Msg
performHealthcheck =
    Healthcheck.getHealthcheck "https://tst-kim.supplychain.cimpress.io/healthcheck"
    |> Task.perform
        (always ())
        (\h ->
            if List.all (\t -> t.result == Healthcheck.Passed) h then
                Healthcheck.Passed
            else
                Healthcheck.Failed
        )

init =
    ( model
    , performHealthcheck
    )

subscriptions model = Time.every (30 * Time.second) (always TriggerHealthCheck)

update msg model =
    case msg of
        TriggerHealthCheck ->
            ( { model | healthCheckInProgress = True }
            , performHealthcheck
            )
        Healthcheck (Ok result) ->
            ( { model | lastHealthCheck = result, healthCheckInProgress = False }
            , Cmd.none
            )

view model =
    let
        statusText =
            case ( model.healthCheckInProgress, model.lastHealthCheck ) of
                ( True, _ ) -> "Checking health..."
                ( False, Healthcheck.Passed ) -> "Service is healthy"
                ( False, Healthcheck.Failed ) -> "Service is not healthy"
    in
        div
            []
            [ text statusText ]

```

## Ports

* Give Auth0 elm
* Create Authorization module
* Create Auth0 ports
* Add connections to ports from JavaScript

```elm
port module Main exposing (..)

import Auth0
import Authentication

type Msg
    | Authentication Authentication.Msg

type alias Model =
    , authModel : Authentication.Model

init =
    , authModel = Authentication.init auth0showLock

update msg model =
    case msg of
        Authentication authMsg ->
            let
                ( authModel, cmd ) = Authentication.update authMsg model.authModel
            in
                ( { model | authModel = authModel }, Cmd.map Authentication cmd )

subscriptions model =
    Sub.batch
    [ ..
    , auth0authResult (Authentication.handleAuthResult >> Authentication)
    ]

-- Auth0 Ports
port auth0showLock : Auth0.Options -> Cmd msg
port auth0authResult : (Auth0.RawAuthenticationResult -> msg) -> Sub msg
```

```javascript
main.ports.auth0showLock.subscribe(function(opts) {
    auth0lock.showSignin(opts,function(err,profile,token) {
        var result = {err:null, ok:null};
        if (!err) {
        result.ok = {profile:profile,token:token};
        } else {
        result.err = err.details;
        }
        main.ports.auth0authResult.send(result);
    });
});
```

Tools:
packages: http://package.elm-lang.org/
elm-format: https://github.com/avh4/elm-format
