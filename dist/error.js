/**
 * Copyright 2015 Oursky Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var NotAuthenticated = 101;
exports.NotAuthenticated = NotAuthenticated;
var PermissionDenied = 102;
exports.PermissionDenied = PermissionDenied;
var AccessKeyNotAccepted = 103;
exports.AccessKeyNotAccepted = AccessKeyNotAccepted;
var AccessTokenNotAccepted = 104;
exports.AccessTokenNotAccepted = AccessTokenNotAccepted;
var InvalidCredentials = 105;
exports.InvalidCredentials = InvalidCredentials;
var InvalidSignature = 106;
exports.InvalidSignature = InvalidSignature;
var BadRequest = 107;
exports.BadRequest = BadRequest;
var InvalidArgument = 108;
exports.InvalidArgument = InvalidArgument;
var Duplicated = 109;
exports.Duplicated = Duplicated;
var ResourceNotFound = 109;
exports.ResourceNotFound = ResourceNotFound;
var NotSupported = 110;
exports.NotSupported = NotSupported;
var NotImplemented = 111;
exports.NotImplemented = NotImplemented;
var ConstraintViolated = 112;
exports.ConstraintViolated = ConstraintViolated;
var IncompatibleSchema = 113;
exports.IncompatibleSchema = IncompatibleSchema;
var AtomicOperationFailure = 114;
exports.AtomicOperationFailure = AtomicOperationFailure;
var PartialOperationFailure = 115;
exports.PartialOperationFailure = PartialOperationFailure;
var UndefinedOperation = 116;
exports.UndefinedOperation = UndefinedOperation;
var PluginUnavailable = 117;
exports.PluginUnavailable = PluginUnavailable;
var PluginTimeout = 118;
exports.PluginTimeout = PluginTimeout;