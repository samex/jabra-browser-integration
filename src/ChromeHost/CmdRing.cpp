/*
Jabra Browser Integration
https://github.com/gnaudio/jabra-browser-integration

MIT License

Copyright (c) 2020 GN Audio A/S (Jabra)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

#include <climits>
#include "stdafx.h"
#include "CmdRing.h"

CmdRing::CmdRing(HeadsetIntegrationService* headsetIntegrationService)
{
  m_headsetIntegrationService = headsetIntegrationService;
}

CmdRing::~CmdRing()
{
}

bool CmdRing::CanExecute(const Request& request)
{
  return (request.message == "ring");
}

void CmdRing::Execute(const Request& request)
{
  const unsigned short deviceId = m_headsetIntegrationService->GetCurrentDeviceId();
  if (deviceId == USHRT_MAX)
  {
	m_headsetIntegrationService->Error(request, "No device", {});
    return;
  }

  // Jabra_GetLock(deviceId);

  Jabra_ReturnCode ret = Jabra_SetRinger(deviceId, true);
  if (ret != Return_Ok)
  {
    m_headsetIntegrationService->Error(request, "Unable to set ringer", { 
      std::make_pair(JSON_KEY_JABRA_RETURN_ERRORCODE, std::to_string(ret)),
      std::make_pair(JSON_KEY_DEVICEID, std::to_string(deviceId)),
	  std::make_pair(JSON_KEY_ACTIVEDEVICE, true)
    });
    return;
  }

  m_headsetIntegrationService->SetRingerStatus(deviceId, true);
}
