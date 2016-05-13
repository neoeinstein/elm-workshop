module Main exposing (..)

import Api.Healthcheck as Healthcheck
import Html exposing (..)
import Html.App as Html
import Time
import Task

main = Html.beginnerProgram { model = {}, view = always (text "I am empty"), update = always identity}

